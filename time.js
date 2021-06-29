

class TimeEl extends HTMLElement {
    constructor() {
        super();
        let shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.innerHTML = `<time><span class=replace></span><slot></slot></time>`;
        this.__timeEl = shadowRoot.querySelector('time');
        this.__slot = shadowRoot.querySelector('slot');
        this.__replaceEl = shadowRoot.querySelector('.replace');
    }
	connectedCallback() {
        this.__timeEl.setAttribute('datetime', this.getAttribute('datetime'));
        this.reset();
    }
    disconnectedCallback(){
        clearInterval(this.__interval);
    }
	static get observedAttributes() {
		return ['datetime','lang','type'];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === 'datetime') {
            this.reset();
            this.__timeEl.setAttribute('datetime', newValue);
		}
		if (name === 'lang') this.reset();
		if (name === 'type') this.reset();
	}
    reset(){
        this.__type = this.getAttribute('type');
        if (this.__type === '') this.__type = 'relative';
        if (this.__type === null && this.innerHTML === '') this.__type = 'relative';
        if (!this.__type) return;
        this.__lang = langFromElement(this);
        this.redraw();
        clearInterval(this.__interval);
        // set interval
        let diff = Math.abs(Date.now() - this.__date);
        let interval = diff > 60*60*12 ? 1000*60*60 : 1000 // diff > 12h ? 1 one hour else one second
        this.__interval = setInterval(()=>this.redraw(), interval);
    }
    redraw(){
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
            this.__replaceEl.innerHTML = show;
            this.__slot.hidden = true;
            this.__replaceEl.setAttribute('title', date);
        }
    }
}

const types = {
    relative(el, date){
        return showRelativeDate(el.__lang, date);
    },
    date(el, date) {
        let defaults = {
            weekday: {default:'short', showAnyway:1},           // "narrow", "short" und "long".
            //era:            // "narrow", "short" und "long".
            year: {default:'numeric', showAnyway:1},            // "numeric" und "2-digit".
            month: {default:'short', showAnyway:1},             // "numeric", "2-digit", "narrow", "short" und "long".
            day: {default:'numeric', showAnyway:1},             // "numeric" und "2-digit".
            hour: {default:'numeric', showAnyway:0},            // "numeric" und "2-digit".
            minute: {default:'numeric', showAnyway:0},          // "numeric" und "2-digit".
            second: {default:'numeric', showAnyway:0},          // "numeric" und "2-digit".
            timeZoneName: {default:'short', showAnyway:0},      // "short" und "long".
        };
        var options = {};
        for (let [key, opts] of  Object.entries(defaults)) {
            var val = el.getAttribute(key);
            if (val === null) {
                if (opts.showAnyway) {
                    options[key] = opts.default;
                }
                continue;
            }
            else if (val === '') options[key] = opts.default;
            else if (val === 'none') options[key] = undefined;
            else options[key] = val;
        }
        return new Intl.DateTimeFormat(el.__lang || 'default', options).format(date);
    },
}

function langFromElement(el) {
    let langEl = el.closest('[lang]') || document.head;
    return langEl.getAttribute('lang') || navigator.language;
}

function showRelativeDate(lang, date){
    var units = {
        year  : 24 * 60 * 60 * 1000 * 365,
        month : 24 * 60 * 60 * 1000 * 365/12,
        day   : 24 * 60 * 60 * 1000,
        hour  : 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000
    }
    var rtf = new Intl.RelativeTimeFormat(lang || 'default', {numeric:'auto'})
    var getRelativeTime = (d1, d2 = new Date()) => {
        var elapsed = d1 - d2
        for (var u in units)
            if (Math.abs(elapsed) > units[u] || u == 'second')
                return rtf.format(Math.round(elapsed/units[u]), u)
    }
    return getRelativeTime(date);
}

customElements.define('u1-time', TimeEl)
