# Absolutedata office hour chrome-extension

## Build Instructions
1. Clone the code https://github.com/harishbisht/chrome-extension
2. open the terminal and follow the steps
```sh
$ git clone https://github.com/harishbisht/chrome-extension
$ cd chrome-extension
```
3. Make the changes in the code
4. Open the link [chrome://extensions/](chrome://extensions/)
5. Click on "load unpacked" button and select the code folder and test the extension.

## Heroku Deployment
1. Download and Install the [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) for your operation system
2. login to the heroku cli and deploy the flask app
```sh
$ heroku login
$ heroku create <appname>
$ git push heroku master
```