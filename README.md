# ZendCon '15 App

This app was made by Espen Hovlandsdal for the ZendCon '13 app contest and has since been used for ZendCon Europe 2013, ZendCon 2014 and now ZendCon 2015.

Note that this app has not been significantly changed since 2013 and as such the technologies and methods used might be a bit outdated.

# Dependencies

* PHP >= 5.3
* cURL-extension
* Memcached-extension
* mod_rewrite or similar
* Guzzle (through Composer)
* Silex (through Composer)

# Development dependencies

* Ruby + gem
* Compass
* node.js (+ npm)
* Bower
* Grunt

# Installing

* Clone repository
* Install node.js + npm
* ``npm install -g bower grunt-cli``
* ``npm install``
* ``bower install``
* ``composer install``
* ``grunt build``
* Serve dist-folder as document root
* Make sure .htaccess file is loaded
* ``ln -s <repo-root>/backend <doc-root>/api``
* Set up a cron to run ``php <repo-root/cron/FeedUpdater.php`` every 5 minutes
* You should be good to go :-)

# Features

* Mark sessions to attend to make your own personal schedule 
* Fetches ZendCon schedule from ZendCon API
* Fetches uncon schedule from Joind.in API
* Shows a list of speakers and their talks
* Shows a map of the venue (Santa Clara Convention Center)
* Twitter stream of related updates
* Photo stream fetches related photos from Instagram and Flickr
* PushState for clean urls without page reloads
* Uses app cache manifest for offline mode and speeding up loading
* Client side templating enables mostly static content for fast delivery and high cachability
* Schedule updates are handled in the background
* Data is fetched from localStorage cache if available, then checks for updates from API and updates view
* Responsive layout for mobile/tablet/desktop view using the same markup and javascript
* Fairly optimized for printing (print stylesheets are hard, OK?)
* Updates from backend are fetched at shorter intervals as conference gets closer
* Backend responds with correct cache headers to prevent using unnecessary bandwidth
* Guzzle with multiple parallel requests against API to optimize speed
* App capable, touch icons in place

Had a good time creating this, hope you like it!
