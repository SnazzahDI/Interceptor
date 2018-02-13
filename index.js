const { Plugin } = require('elements')
const { EventEmitter } = require('eventemitter3')

module.exports = class FakeConnections extends Plugin {
  preload () {
    const _this = this;
    class InterceptedWebSocket extends window.WebSocket {
      constructor(url) {
        super(url);
        this.interceptor = new EventEmitter();
        this.interceptor.ws = this;
        super.addEventListener('message', d => this.interceptor.emit('data', d));
        super.addEventListener('open', d => this.interceptor.emit('open'));
        super.addEventListener('close', d => this.interceptor.emit('close'));
        super.addEventListener('error', d => this.interceptor.emit('error'));
        _this.onWSIntercept(this.interceptor);
      }

      send(data){
        super.send(data);
        this.interceptor.emit('sending', data);
      }

      close(...a){
        super.close(...a);
        this.interceptor.emit('closing', ...a);
      }
    }
    this.iws = window.WebSocket = InterceptedWebSocket;
    this.ws = window.WebSocket;

    this.xmlhr = window.XMLHttpRequest;
    class InterceptedXMLHttpRequest extends this.xmlhr {
      constructor(...a) {
        super(...a);
        this.interceptor = new EventEmitter();
        this.interceptor.request = this;
        _this.onXMLIntercept(this.interceptor);

        this.addEventListener('load', () => this.interceptor.emit('response', this.response, this))
        this.addEventListener("progress", () => this.interceptor.emit('progress', this));
        this.addEventListener("error", () => this.interceptor.emit('error', this));
        this.addEventListener("abort", () => this.interceptor.emit('abort', this));

        this.upload.addEventListener("load", () => this.interceptor.emit('upload-load', this));
        this.upload.addEventListener("progress", () => this.interceptor.emit('upload-progress', this));
        this.upload.addEventListener("error", () => this.interceptor.emit('upload-error', this));
        this.upload.addEventListener("abort", () => this.interceptor.emit('upload-abort', this));
      }

      open(method, url, ...a) {
        this.interceptor.emit('opened', method, url, this);
        super.open(method, url, ...a);
      }

      send(body) {
        this.interceptor.emit('sending', body, this);
        super.send(body);
      }
    }
    this.ixmlhr = InterceptedXMLHttpRequest;
    window.XMLHttpRequest = InterceptedXMLHttpRequest;
    document.XMLHttpRequest = InterceptedXMLHttpRequest;
  }

  onWSIntercept (ic) {
    this.emit('websocket-intercepted', ic);
  }

  onXMLIntercept(ixml){
    this.emit('request-intercepted', ixml);
    ixml.once('opened', (m, u) => this.emit('request-open', u, m, ixml));
  }

  load () {}
  unload () {
    window.WebSocket = this.ws;
    window.XMLHttpRequest = this.xmlhr;
    document.XMLHttpRequest = this.xmlhr;
  }

  get color() {
    return 'f37024';
  }
}
