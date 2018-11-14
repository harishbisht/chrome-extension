import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import uuid
import ipdb
from datetime import datetime
from tornado.options import define, options

import os
ON_HEROKU = os.environ.get('ON_HEROKU')
if ON_HEROKU:
    # get the heroku port
    port = int(os.environ.get('PORT', 17995))  # as per OP comments default is 17995
else:
    port = 3000

define("port", default=port, help="run on the given port", type=int)

# define("port", default=8888, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            (r"/chatsocket", ChatSocketHandler),
        ]
        settings = dict(
            # cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
        )
        super(Application, self).__init__(handlers, **settings)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("chat.html")
        # self.render("index.html", messages=ChatSocketHandler.cache)


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    pairing = {}
    waiting = []
    messages = ('Your are now connected with anonymous user', 'Waiting for other user to connect',
                'Sorry, Other user is offline', 'Not Connected')

    def get_compression_options(self):
        return {}

    # when new connection is open
    def open(self):
        if self.waiting:
            waiting = self.waiting.pop()
            self.pairing[self] = waiting
            self.pairing[waiting] = self
            self.send_message(self.messages[0])
            waiting.send_message(self.messages[0])
        else:
            self.waiting.append(self)
            self.send_message(self.messages[1])

    # when existing connection is closed
    def on_close(self):
        if self in self.pairing:
            self.pairing[self].send_message(self.messages[2])
            paired = self.pairing.pop(self)
            self.pairing.pop(paired)
            '''
            if you want to connect the user to some new user
            '''
            # self.waiting.append(paired)
            # paired.send_message(self.messages[1])
        else:
            if self in self.waiting:
                self.waiting.remove(self)
            pass

    # on_message recives the uncoming messages
    def on_message(self, message):
        # logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
        if self in self.pairing:
            self.pairing[self].send_message(parsed['body'],owner=0)
            self.send_message(parsed['body'],owner=1)
        else:
            self.send_message(self.messages[3],owner=1)
    # custom function to send the message
    def send_message(self, message,owner=1):
        chat = {
            "id": str(uuid.uuid4()),
            "body": message,
            "owner": owner,
            "time":datetime.now().strftime("%I:%M:%S")
            }
        chat["html"] = tornado.escape.to_basestring(
            self.render_string("message.html", message=chat))
        self.write_message(chat)



def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
