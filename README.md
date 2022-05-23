# &lt;u1-time&gt;

## Features

- live changing relative dates 
- generates a title attribute with the absolute date

## Ussage

```html
The end of the world is
<u1-time datetime="2050-01-01">on 2050-01-01</u1-time>.
<!-- replaces : "on 2050-01-01" with "in 28 years" -->
```

## Attributes

Attribute        | Options                      | Default         | Description
---              | ---                          | ---             | ---
`datetime`       | ISO 8601 date                | required        | e.g. `2011-10-10T14:48:00`
`lang`           | language                     | parent lang     | If not present navigator.language is used
`type`           | date, relative               | relative        | The way the date should be displayed



### If type=date

Attribute        | Options                                      | Default       | Description
---              | ---                                          | ---           | ---
`weekday`        | narrow, short, long, none                    | short         | Format weekday as `Sun` or `Sunday`
`year`           | numeric, 2-digit, none                       | numeric       | Format year as `14` or `2014`
`month`          | numeric, 2-digit, narrow, short, long, none  | numeric       | Format month as `Jun` or `June`
`day`            | numeric, 2-digit, none                       | numeric       | Format day as `01` or `1`
`hour`           | numeric, 2-digit, none                       | none          | Format hour as `01` or `1`
`minute`         | numeric, 2-digit, none                       | none          | Format minute as `05` or `5`
`second`         | numeric, 2-digit, none                       | none          | Format second as `05` or `5`


### If type=relative

Attribute        | Options                                      | Default       | Description
---              | ---                                          | ---           | ---
`style`          | narrow, short, long                          | short         | `28 minutes ago` , `29 min. ago` 


## Todo
- rename the style-attribute to something different 🙈  
- recognise the resolution of the given date (has time or not)
- optional provide date as innerHTML

## Demos
https://raw.githack.com/u1ui/time.el/main/tests/minimal.html  
https://raw.githack.com/u1ui/time.el/main/tests/test.html  

