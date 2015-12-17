var _ = require('lodash'),
    request = require('request'),
    util = require('./util.js');

var apiURL = 'http://api.wunderground.com/api/';

var pickInputs = {
        'country': 'country',
        'city': 'city',
        'state': 'state'
    },
    pickOutputs = {
        'percentIlluminated': 'moon_phase.percentIlluminated',
        'ageOfMoon': 'moon_phase.ageOfMoon',
        'current_time_hour': 'moon_phase.current_time.hour',
        'current_time_minute': 'moon_phase.current_time.minute',
        'sunrise': 'moon_phase.sunrise',
        'sunset': 'moon_phase.sunset'
    };

module.exports = {

    /**
     * Get auth data.
     *
     * @param dexter
     * @returns {*}
     */
    authorizeRequest: function (dexter) {

        if(!dexter.environment('wunderground_api_key')) {

            this.fail('A [wunderground_api_key] environment variable is required for this module');

            return false;
        } else {

            request = request.defaults({
                baseUrl: apiURL.concat(_(dexter.environment('wunderground_api_key')).toString().trim())
            });

            return true;
        }
    },

    /**
     * Check correct inputs data.
     *
     * @param step
     * @param pickInputs
     * @returns {*}
     */
    checkInputStruct: function (step, pickInputs) {
        var requestData = util.pickStringInputs(step, pickInputs),
            uriData = [];

        if (requestData.country)
            uriData.push(requestData.country);

        if (requestData.state)
            uriData.push(requestData.state);

        if (requestData.city)
            uriData.push(requestData.city);


        if (uriData.length < 2) {

            this.fail('A [country,city or state] inputs need for this module.');

            return false;
        }

        return uriData;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var uriData = this.checkInputStruct(step, pickInputs),
            uri = 'astronomy/q/' + uriData.join('/') + '.json';

        if (!this.authorizeRequest(dexter) || !uriData)
            return;


        request.get({uri: uri, json: true}, function (error, response, data) {

            if (error)
                this.fail(error);

            else if (data.error)
                this.fail(data.error);

            else if (response.statusCode !== 200)
                this.fail(response.statusCode + ': Something is happened');

            else
                this.complete(util.pickResult(data, pickOutputs));
        }.bind(this));
    }
};
