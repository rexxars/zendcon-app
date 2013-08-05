<?php
/**
 * This cron-script pulls the feeds from Confex, updating the local cache.
 */

require_once __DIR__ . '/../vendor/autoload.php';

$config = require __DIR__ . '/../backend/config/config.php';
$config['readFromCache'] = false;

// Config says not to read from cache, but it will still *write*
// Thus, all we need for this to work is to actually call the getters
$feedClient = new Zendcon\Client($config);
$feedClient->getSchedule();

// Fetch Joind.in sessions
$joindIn = JoindIn\Client::factory();
$talks   = $joindIn->getEventTalks(
    $config['joind.in']['unconEventId'],
    array(
        'verbose' => 'yes',
        'resultsperpage' => 0,
    )
);

// Store in memcached
if (!empty($talks)) {
    $schedule = $feedClient->convertJoindInTalksToSchedule($talks);

    $cache  = new Memcached();
    $cache->addServers($config['memcached']);
    $cache->set(
        'getEventTalks::' . $config['joind.in']['unconEventId'],
        $schedule,
        900
    );
}
