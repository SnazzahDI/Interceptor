<div align="center">
  <img src="https://i-need.discord.cards/b0eaaf.png" alt="interceptor logo" />
  <hr>
  <h1>Interceptor</h1>
  <p>Intercepts outgoing requests. (WebSocket &amp; HTTP Requests)</p>
  <i><a href="https://github.com/SnazzahDI/Interceptor/wiki">Wiki</a></i>
  <br>
  <br>
  <code><b>NOTE: This plugin does not intercept the main Discord websocket on startup.</b></code>
  <br>
  <br>
  <br>
</div>

### Intercepting WebSocket creations
```js
const interceptor = this.manager.get('Interceptor');
interceptor.on('websocket-intercepted', iee => {
  if(iee.ws.url.includes("dealer.spotify.com")) this.spotifyWS = iee;
  iee.on('data', this.spotifyData);
});
```

### Intercepting HTTP requests
```js
const interceptor = this.manager.get('Interceptor');
interceptor.on('request-open', (url, method, iee) => {
  if(url.includes("spotify.com")) iee.on('data', this.handleSpotifyRequest);
});
```
