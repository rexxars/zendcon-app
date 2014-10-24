<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request,
    Symfony\Component\HttpFoundation\Response,
    Symfony\Component\HttpFoundation\JsonResponse;

$config      = require 'config/config.php';
$roomNumbers = require 'config/zceu-room-numbers.php';
$feedClient  = new Zendcon\Client($config);

$cache = new Memcached();
$cache->addServers($config['memcached']);

$app = new Silex\Application();
$app['debug'] = true;

$app->get('/', function() use ($app) {
    return $app->json(array('app' => 'ZendCon App Backend'));
});

$app->get('/schedule', function(Request $request) use ($app, $feedClient, $config, $cache, $roomNumbers) {
    $lastModified = new DateTime('@' . ($cache->get('zendconLastUpdated') ?: time()));

    $response = new JsonResponse();
    $response->setLastModified($lastModified);
    $response->setPublic();
    if ($response->isNotModified($request)) {
        return $response;
    }

    // Try to fetch from memcached
    $talks = $cache->get('getEventTalks::' . $config['joind.in']['zendconEventId']);
    if (!empty($talks) && false) {
        $response->setData($talks);
        return $response;
    }

    // Fetch from API
    $joindIn  = JoindIn\Client::factory();
    $talks = $joindIn->getEventTalks(
        $config['joind.in']['zendconEventId'],
        array(
            'verbose' => 'yes',
            'resultsperpage' => 0,
        )
    );

    if (!is_array($talks)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    $schedule = $feedClient->convertJoindInTalksToSchedule($talks);

    // Map room numbers
    foreach ($schedule as &$talk) {
        $sessionId = $talk['SessionID'];

        preg_match('#(Room|Hall) (\d+|A|B)$#', $talk['SessionAbstract'], $matches);

        if (!isset($talk['Room']) && !empty($matches)) {
            $talk['Room'] = $matches[0];
        }
    }

    // Store in memcached
    $cache->set('zendconLastUpdated', time());
    $cache->set(
        'getEventTalks::' . $config['joind.in']['zendconEventId'],
        $schedule,
        900
    );

    $response->setData($schedule);
    return $response;
});

$app->get('/uncon', function(Request $request) use ($app, $feedClient, $config, $cache) {
    $lastModified = new DateTime('@' . ($cache->get('unconLastUpdated') ?: time()));

    $response = new JsonResponse();
    $response->setLastModified($lastModified);
    $response->setPublic();
    if ($response->isNotModified($request)) {
        return $response;
    }

    // Try to fetch from memcached
    $talks = $cache->get('getEventTalks::' . $config['joind.in']['unconEventId']);
    if (!empty($talks)) {
        $response->setData($talks);
        return $response;
    }

    // Fetch from API
    $joindIn  = JoindIn\Client::factory();
    $talks = $joindIn->getEventTalks(
        $config['joind.in']['unconEventId'],
        array(
            'verbose' => 'yes',
            'resultsperpage' => 0,
        )
    );

    if (!is_array($talks)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    $schedule = $feedClient->convertJoindInTalksToSchedule($talks);

    // Store in memcached
    $cache->set('unconLastUpdated', time());
    $cache->set(
        'getEventTalks::' . $config['joind.in']['unconEventId'],
        $schedule,
        900
    );

    $response->setData($schedule);
    return $response;
});

// Enable JSONP-support
$app->after(function(Request $request, Response $response) {
    if (!$request->get('callback')) {
        return;
    }

    $normalized = preg_replace('/[^A-Za-z0-9_.]/i', '', $request->get('callback'));
    $response->setContent($normalized . '(' . $response->getContent() . ')');
});

$app->run();
