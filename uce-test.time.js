import {define, render, html, svg, css} from "https://unpkg.com/uce@1.16.2/esm/index.js?module"
//import {define, render, html, svg, css} from 'https://cdn.jsdelivr.net/npm/uce@1.16.2/min.js';



const types = {
    relative(el, date){
        const style = el.getAttribute('style') || 'long';
        const rtf = new Intl.RelativeTimeFormat(el.__lang, {
            //localeMatcher: , // 'best fit', 'lookup'
            numeric:'auto', // always, auto
            style: style // long, narrow, short
        });
        const elapsed = date - Date.now();
        for (let u in units)
            if (Math.abs(elapsed) > units[u] || u == 'second')
                return rtf.format(Math.round(elapsed/units[u]), u)
    },
    date(el, date) {
        const defaults = {
            weekday:      {default:'short',   showAnyway:1},    // "narrow", "short", "long".
            //era:                                              // "narrow", "short", "long".
            year:         {default:'numeric', showAnyway:1},    // "numeric", "2-digit".
            month:        {default:'short',   showAnyway:1},    // "numeric", "2-digit", "narrow", "short", "long".
            day:          {default:'numeric', showAnyway:1},    // "numeric", "2-digit".
            hour:         {default:'numeric', showAnyway:0},    // "numeric", "2-digit".
            minute:       {default:'numeric', showAnyway:0},    // "numeric", "2-digit".
            second:       {default:'numeric', showAnyway:0},    // "numeric", "2-digit".
            timeZoneName: {default:'short',   showAnyway:0},    // "short", "long".
        };
        const options = {};
        for (let [key, opts] of  Object.entries(defaults)) {
            var val = el.getAttribute(key);
            if (val === null) {
                if (opts.showAnyway) options[key] = opts.default;
                continue;
            }
            else if (val === '' || val === 'true') options[key] = opts.default;
            else if (val === 'none') options[key] = undefined;
            else options[key] = val;
        }
        return new Intl.DateTimeFormat(el.__lang, options).format(date);
    },
}

function langFromElement(el) {
    let langEl = el.closest('[lang]') || document.head;
    return langEl.getAttribute('lang') || navigator.language;
}


const units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}



define('my-counter', {
    attachShadow: { mode: 'open' },
    init() {
      this.count = 0;
      this.dec = () => {this.count--;this.render();};
      this.inc = () => {this.count++;this.render();};
      this.render();
    },
    render() {
      this.html`
        <style>
        * {
          font-size: 200%;
        }
        span {
          width: 4rem;
          display: inline-block;
          text-align: center;
        }
        button {
          width: 64px;
          height: 64px;
          border: none;
          border-radius: 10px;
          background-color: seagreen;
          color: white;
        }
        </style>
        <button onclick="${this.dec}">-</button>
        <span>${this.count}</span>
        <button onclick="${this.inc}">+</button>
      `;
    } });



define('u1-time', {
    attachShadow: {mode: 'open'},

    style: selector => css`${selector} {
      font-weight: bold;
    }`,


    init() {
        let shadowRoot = this.shadowRoot;
        shadowRoot.innerHTML = `<time><span class=replace></span><slot></slot></time>`;
        this.__timeEl = shadowRoot.querySelector('time');
        this.__slot = shadowRoot.querySelector('slot');
        this.__replaceEl = shadowRoot.querySelector('.replace');
        this.__timeEl.setAttribute('datetime', this.getAttribute('datetime'));
    },
    reset(){
        this.__type = this.getAttribute('type');
        if (this.__type === '') this.__type = 'relative';
        if (this.__type === null && this.innerHTML === '') this.__type = 'relative';
        if (!this.__type) return;
        this.__lang = langFromElement(this) || 'default';
        this.render();
        clearInterval(this.__interval);
        // set interval
        let diff = Math.abs(Date.now() - this.__date)/1000;
        let interval = diff > 60*60*12 ? 1000*60*60 : 1000 // diff > 12h ? 1 one hour else one second
        this.__interval = setInterval(()=>this.render(), interval);
    },
    render(){
        let date = this.getAttribute('datetime');
        date = date.match(/^[0-9.]+$/) ? Number(date) : Date.parse(date);
        date = new Date(date);
        this.__date = date;
        if (isNaN(date)) {
            this.__replaceEl.innerHTML = '';
            this.__slot.hidden = false;
            this.__replaceEl.removeAttribute('title');
        } else {
            let fn = types[this.__type];
            if (!fn) {
                console.warn('type '+this.__type+' is not supported');
                return;
            }
            let show = fn(this, date);
            if (this.__replaceEl.innerHTML !== show) this.__replaceEl.innerHTML = show; // dont redraw, but is innerHTML getter more expensive?
            this.__slot.hidden = true;

            // provide a title-attribute if it is relative
            if (this.__type === 'relative') {
                this.__replaceEl.setAttribute('title', types['date'](this, date));
            } else {
                this.__replaceEl.removeAttribute('title');
            }
        }
    },

    props: {},
    bound: [],

    observedAttributes: ['datetime','lang','type','weekday','year','month','day','hour','minute','second','style'],

    attributeChanged(name, old, value){
        console.log(arguments)
		if (old === value) return;
        //if (!this.isConnectedX) return; // attributeChangedCallback calls before connectedCallback so prevent to reset twice
		if (name === 'datetime') {
            this.__timeEl.setAttribute('datetime', value);
		}
        this.reset();
    },

    connected() {
        this.reset();
        this.isConnectedX = true;
    },
    disconnected() {
        clearInterval(this.__interval);
    },

  });
