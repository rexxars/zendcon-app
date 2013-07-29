<?php
/*
 * This file is part of the Zendcon App backend
 *
 * (c) Espen Hovlandsdal <espen@hovlandsdal.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Zendcon;

use Guzzle\Http\Client as GuzzleClient,
    Exception,
    Memcached,
    DateTime;

class Client {

    const BASE_URL = 'https://zendcon.confex.com/zendcon/2013/sync.cgi/';
    const DEFAULT_TTL = 900;

    private $client;
    private $cache;
    private $readFromCache;

    private $filterKeys = array(
        'session' => array(
            'SessionProgram',
            'SessionType',
            'FinalSessionNumber',
        ),
        'slot' => array(
            'Property',
        ),
        'role' => array(
            'EntryTable',
            'OrderWithinRole',
            'Role',
            'SequenceOfRoles',
        ),
        'person' => array(),
        'abstract' => array(),
    );

    public function __construct($config) {
        $this->client = new GuzzleClient(self::BASE_URL);
        $this->cache  = new Memcached();
        $this->cache->addServers($config['memcached']);
        $this->readFromCache = isset($config['readFromCache']) ? $config['readFromCache'] : true;
    }

    public function getSessions() {
        $sessions = $this->request('Session.json');
        return $this->filterPropsFromEntries($sessions, $this->filterKeys['session']);
    }

    public function getRoles() {
        $roles = $this->request('Role.json');
        return $this->filterPropsFromEntries($roles, $this->filterKeys['role']);
    }

    public function getPersons() {
        $persons = $this->request('Person.json');
        return $persons;
    }

    public function getSlots() {
        $slots = $this->request('Slot.json');
        return $this->filterPropsFromEntries($slots, $this->filterKeys['slot']);
    }

    public function getSessionAbstract() {
        return $this->request('SessionAbstract.json');
    }

    public function getSpeakers($filtered = false) {
        // According to the ZendCon sync API docs, no other roles than
        // "Speaker" are going to be used. In case this changed, we leave the
        // filtered option here to be able to actually filter on the role
        if (!$filtered) {
            return $this->getPersons();
        }

        $roles   = $this->getRoles();
        $persons = $this->getPersons();
        if (empty($roles) || empty($persons)) {
            return false;
        }

        $speakers = array_filter($roles, function($entry) {
            return $entry['Role'] == 'Speaker';
        });

        $speakerIds = array_map(function($entry) {
            return (int) $entry['PersonID'];
        }, $speakers);

        $speakers = $this->getByIds($persons, $speakerIds);

        return $speakers;
    }

    public function getSchedule() {
        $cacheKey = __METHOD__;
        if ($this->readFromCache) {
            $response = $this->cache->get($cacheKey);
            if (!empty($response)) {
                return $response;
            }
        }

        $combined = array();
        try {
            $responses = $this->client->send(array(
                $this->client->get('Session.json'),
                $this->client->get('Slot.json'),
                $this->client->get('Role.json'),
                $this->client->get('Person.json'),
                $this->client->get('SessionAbstract.json'),
            ));

            $responses = array_combine(array(
                'session',
                'slot',
                'role',
                'person',
                'abstract'
            ), $responses);

            foreach ($responses as $key => $response) {
                $body = json_decode($response->getBody(), true);
                $data = isset($body['data']) ? $body['data'] : array();
                $data = array_map(array($this, 'filterProps'), $data);
                $data = $this->assignKeys($data);
                $data = $this->filterPropsFromEntries($data, $this->filterKeys[$key]);

                $combined[$key] = $data;
            }
        } catch (Exception $e) {
            return false;
        }

        // We need to merge these five:
        // - Sessions contain the title, track and technology level
        // - Slots contain the date/time, and room number
        // - Roles contain the SessionID => PersonID relation
        // - Persons contain the speakers name, position and company
        // - Session abstracts contain the extended description of a talk

        $schedule = array();
        foreach ($combined['session'] as $sessionId => $session) {
            $entry = array_merge(
                $this->findEntry($combined['slot'], 'SessionID', $sessionId),
                $this->findEntry($combined['role'], 'EntryID', $sessionId) ?: array(),
                isset($combined['abstract'][$sessionId]) ? $combined['abstract'][$sessionId] : array(),
                $session
            );

            if (isset($entry['PersonID']) && isset($combined['person'][$entry['PersonID']])) {
                $entry = array_merge($entry, $combined['person'][$entry['PersonID']]);
            }

            $schedule[$sessionId] = $entry;
        }

        // Now sort by date/time
        usort($schedule, function($a, $b) {
            $aDate = $a['Date'] . $a['StartTime'];
            $bDate = $b['Date'] . $b['StartTime'];

            return strcmp($aDate, $bDate);
        });

        if (!empty($schedule)) {
            $this->cache->set($cacheKey, $schedule, self::DEFAULT_TTL);
        }

        return $schedule;
    }

    public function convertJoindInTalksToSchedule($talks) {
        $schedule = array();

        foreach ($talks as $talk) {
            // Let's push the ID up to prevent colliding with the ZendCon session IDs
            $talk['id'] += 30000;

            // For what we can directly translate...
            $session = array(
                'SessionID'       => $talk['id'],
                'EntryID'         => $talk['id'],
                'SessionAbstract' => $talk['talk_description'],
                'SessionTitle'    => $talk['talk_title'],
            );

            // Parse date
            $date = DateTime::createFromFormat(DateTime::W3C, $talk['start_date']);
            $session['Date'] = $date->format('Y-m-d');
            $session['StartTime'] = $date->format('H:i:s');

            // Parse speaker names into firstname/lastname, get speaker image if present
            $speakerImg = null;
            $speakers = array_reduce(
                $talk['speakers'],
                function($current, $speaker) use (&$speakerImg) {
                    if (!is_array($current)) {
                        $current = array();
                    }

                    $image      = isset($speaker['speaker_img']) ? $speaker['speaker_img'] : null;
                    $speakerImg = $speakerImg ?: $image;
                    $current[]  = $speaker['speaker_name'];
                    return $current;
                }
            );

            $speakers = implode(', ', $speakers);
            $name     = explode(' ', $speakers, 2);
            $session['FirstName']  = $name[0];
            $session['LastName']   = isset($name[1]) ? $name[1] : '';
            $session['SpeakerImg'] = $speakerImg;

            $schedule[] = $session;
        }

        // Now sort by date/time
        usort($schedule, function($a, $b) {
            $aDate = $a['Date'] . $a['StartTime'];
            $bDate = $b['Date'] . $b['StartTime'];

            return strcmp($aDate, $bDate);
        });

        return $schedule;
    }

    protected function getByIds($entries, $ids) {
        return array_intersect_key($entries, array_flip($ids));
    }

    protected function findEntry($entries, $key, $value) {
        foreach ($entries as $entry) {
            if (isset($entry[$key]) && $entry[$key] == $value) {
                return $entry;
            }
        }

        return false;
    }

    protected function filterProps($entry, $removeKeys = array()) {
        foreach ($entry as $key => $value) {
            if ($key[0] == '_' || in_array($key, $removeKeys)) {
                unset($entry[$key]);
            }
        }

        return $entry;
    }

    protected function filterPropsFromEntries($entries, $removeKeys = array()) {
        $data = array();
        foreach ($entries as $key => $value) {
            $data[$key] = $this->filterProps($value, $removeKeys);
        }

        return $data;
    }

    protected function assignKeys($entries) {
        $assigned = array();

        foreach ($entries as $entryId => $entry) {
            foreach ($entry as $key => $value) {
                if (strpos($key, 'Key_') === 0) {
                    $entryId = $value;
                    unset($entry[$key]);

                    break;
                }
            }

            $entry['id'] = $entryId;
            $assigned[$entryId] = $entry;
        }

        return $assigned;
    }

    protected function request($url, $params = null) {
        $url .= empty($params) ? '' : ('?' . http_build_query($params));

        $cacheKey = __METHOD__ . ':' . $url;
        if ($this->readFromCache) {
            $response = $this->cache->get($cacheKey);
            if (!empty($response)) {
                return $response;
            }
        }

        $request  = $this->client->get($url);
        $response = $request->send();

        try {
            $body = json_decode($response->getBody(), true);
            $data = isset($body['data']) ? $body['data'] : array();
            $data = array_map(array($this, 'filterProps'), $data);
            $data = $this->assignKeys($data);

            if (!empty($data)) {
                $this->cache->set($cacheKey, $data, self::DEFAULT_TTL);
            }
        } catch (Exception $e) {
            return false;
        }

        return $data;
    }

}
