# jserrlogger
> A javascript module that catches javascript errors and posts them back to a server to be logged and managed.

## Including jserrlogger.js

##

### Add a script tag to your page

```html
<script src="jserrlogger.min.js"></script>
```

### Install the handler

```html
<script>
    jserrlogger.install("http://www.your-url.com/err_js_endpoint");
</script>
```

### Install the handler with options

```html
<script>
    var options = {
        upperLimit: 5,
        debug: 1,
        timeout: 3000
    };
    jserrlogger.install("http://www.your-url.com/err_js_endpoint", options);
</script>
```

Options available to specify:
* upperLimit - when set, only report the first upperLimit errors in one browser session, ignore any errors after that
* debug - when enabled, log to console any errors
* timeout - timeout after which the jsonp script is removed from the DOM (in ms)


### Implement the server side endpoint

jserrlogger will send GET requests like these:

```url
http://www.your-url.com/err_js_enpoint/?i=1&sn=<encoded_page_url>&fl=<encoded_js_file_name>&ln=<line_number>&err=<encoded_err_message>
```

Handle it on the server side as you see fit (i.e. log them in a DB, email them, etc.)

### You can report your own errors

Use jserrlogger.logErr call to report your own errors to the server side.

```js
    jserrlogger.logErr("Someone stepped on the boobytrap.", "app.js", 834);
```

## How does it work?

jserrlogger.js installs a callback on window.onerror. This is a callback that gets called whenever there's a javascript error on a page (which is not caught). These errors can come up from your code or any 3rd party js libraries you use.
jserrlogger.js will then submit a JSONP request to your configured URL endpoint (the one you specify in the call to install) and send you in the query string:
* i - an enumerator of the exception since the start of the browser session (0 - first, etc.)
* sn - the URL of the page as shown in the browser where the exception was raised
* fl - the js file name where the exception was raised
* ln - the line number where the exception was raised
* err - the actual message of the exception raised

jserrlogger.js will also call any previously installed window.onerror callback.


## Building and testing

```sh
#Clone the repo
git clone https://github.com/ciprianmiclaus/jserrlogger.git

#Change dir into it
cd jserrlogger

#Install the dependencies
npm install

#Build (will run tests too)
npm run build

#Test
npm test
```

Your minified build will be in the /lib directory.


## Contributing

By all means! Raise issues and send pull requests as per usual github workflow.
