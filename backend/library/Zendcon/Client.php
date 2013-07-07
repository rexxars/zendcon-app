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
    Memcached;

class Client {

    const BASE_URL = 'https://zendcon.confex.com/zendcon/2013/sync.cgi';
    const DEFAULT_TTL = 900;

    private $client;
    private $cache;
    private $readFromCache;

    public function __construct($config) {
        $this->client = new GuzzleClient(self::BASE_URL);
        $this->cache  = new Memcached();
        $this->cache->addServers($config['memcached']);
        $this->readFromCache = isset($config['readFromCache']) ? $config['readFromCache'] : true;
    }

    public function getSessions() {
        $sessions = $this->request('Session.json');
        return $this->filterPropsFromEntries($sessions, array(
            'SessionProgram',
            'SessionType',
            'FinalSessionNumber',
        ));
    }

    public function getRoles() {
        $roles = $this->request('Role.json');
        return $this->filterPropsFromEntries($roles, array(
            'EntryTable',
            'OrderWithinRole',
            'Role',
            'SequenceOfRoles',
        ));
    }

    public function getPersons() {
        $persons = $this->request('Person.json');
        array_walk($persons, function(&$person) {
            if ($person['JobTitle'] == 'Test') {
                $person['JobTitle'] = '';
            }

            if ($person['Company'] == 'Test') {
                $person['Company'] = '';
            }
        });

        return $persons;
    }

    public function getSlots() {
        $slots = $this->request('Slot.json');
        return $this->filterPropsFromEntries($slots, array(
            'Property',
        ));
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
        $sessions  = $this->getSessions();
        $slots     = $this->getSlots();
        $roles     = $this->getRoles();
        $persons   = $this->getPersons();
        $abstracts = $this->getSessionAbstract();

        // We need to merge these five:
        // - Sessions contain the title, track and technology level
        // - Slots contain the date/time, and room number
        // - Roles contain the SessionID => PersonID relation
        // - Persons contain the speakers name, position and company
        // - Session abstracts contain the extended description of a talk

        $schedule = array();
        foreach ($sessions as $sessionId => $session) {
            $entry = array_merge(
                $session,
                $this->findEntry($slots, 'SessionID', $sessionId),
                $this->findEntry($roles, 'EntryID', $sessionId) ?: array(),
                isset($abstracts[$sessionId]) ? $abstracts[$sessionId] : array()
            );

            if (isset($entry['PersonID']) && isset($persons[$entry['PersonID']])) {
                $entry = array_merge($entry, $persons[$entry['PersonID']]);
            }

            $schedule[$sessionId] = $entry;
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

        $response = $this->cache->get($cacheKey);
        if ($this->readFromCache && !empty($response)) {
            return $response;
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
