// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

$(function () {
    const msgpack = require('msgpack5')()
        ejs = require('ejs'),
        fs = require('fs')

    var is_fetch = 1;

    /**
     * Load a ejs template.
     *
     * @param name
     * @param object
     *
     * @returns {String}
     */
    function loadTemplate(name, object) {
        var tpl = fs.readFileSync(__dirname + '/partials/' + name + '.ejs');
        return ejs.render(tpl.toString(), object);
    }

    function toFormatHex(data) {
        var newString  = data.toString('hex').toUpperCase().match(/.{2}/g).join(' ');
        return newString;
    }

    $("#btn-test").click(function() {
        var mqtt = require('mqtt')
            host = 'mqtt://' + $('input[name=mqtt-host]').val()
            port = parseInt($('input[name=mqtt-port]').val())
            topic = $('input[name=mqtt-topic]').val()

        var client  = mqtt.connect(host, {
            port: port
        })

        client.on('connect', function () {
            console.log("connected")
            client.subscribe(topic)
        })

        $('#container').html(loadTemplate("devices-cont", null));
        client.on('message', function (topic, message) {
            if (!is_fetch) {
                return;
            }

            var data = msgpack.decode(message);
            data.cnt = data.devices.length;
            data.devices.splice(20);
            for(var i = 0; i < data.devices.length; i++) {
                data.devices[i] = toFormatHex(data.devices[i]);
            }

            $('#cont-dev').prepend(loadTemplate('devices', data));
            $('#cont-dev a:gt(15)').remove();
        })

        $('#opt-start').change(function() {
            is_fetch = 1;
        });

        $('#opt-pause').change(function() {
            is_fetch = 0;
        });

        $('#cont-dev').on('click', 'a', function() {
            $('#cont-dev a').removeClass("active");
            $(this).addClass("active");
        });

    });
});
