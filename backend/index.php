<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request,
    Symfony\Component\HttpFoundation\Response;

// @todo Move this outside the webroot
$config = require 'config/config.php';
$feedClient = new Zendcon\Client($config);

$app = new Silex\Application();
$app['debug'] = true;

$app->get('/', function() use ($app) {
    return $app->json(array('app' => 'ZendCon App Backend'));
});

$app->get('/roles', function() use ($app, $feedClient) {
    $roles = $feedClient->getRoles();

    if (empty($roles)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    return $app->json($roles);
});

$app->get('/speakers', function() use ($app, $feedClient) {
    $speakers = $feedClient->getSpeakers();

    if (empty($speakers)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    return $app->json($speakers);
});

$app->get('/schedule', function() use ($app, $feedClient) {
    $schedule = $feedClient->getSchedule();

    if (empty($schedule)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    return $app->json($schedule);
});

$app->get('/schedule', function() use ($app, $feedClient) {
    $schedule = $feedClient->getSchedule();

    if (empty($schedule)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    return $app->json($schedule);
});

$app->get('/uncon', function() use ($app, $feedClient, $config) {
    // Try to fetch from memcached
    $cache = new Memcached();
    $cache->addServers($config['memcached']);
    $talks = $cache->get('getEventTalks::' . $config['joind.in']['unconEventId']);
    if (!empty($talks)) {
        return $app->json($talks);
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

    if (empty($talks)) {
        return $app->json(array('error' => 'Invalid response'), 503);
    }

    $schedule = $feedClient->convertJoindInTalksToSchedule($talks);

    // Store in memcached
    $cache->set(
        'getEventTalks::' . $config['joind.in']['unconEventId'],
        $schedule,
        900
    );

    return $app->json($schedule);
});

// Enable JSONP-support
$app->after(function(Request $request, Response $response) {
    if (!$request->get('callback')) {
        return;
    }

    $normalized = preg_replace('/[^A-Za-z0-9_.]/i', '', $request->get('callback'));
    $response->setContent($normalized . '(' . $response->getContent() . ')');
});

// Set cache headers
$app->after(function(Request $request, Response $response) {
    if (!$response->isSuccessful()) {
        return;
    }

    $cacheTime = floor(Zendcon\Client::DEFAULT_TTL / 2);
    $expires = new DateTime('@' . (time() + $cacheTime));

    $response->setExpires($expires);
    $response->setMaxAge($cacheTime);
    $response->setPublic();
});

$app->run();
