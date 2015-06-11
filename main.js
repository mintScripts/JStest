// This is the JavaScript test.  In this test, you will pull website
// performance data from the Compete.com API and use it to display a
// graph.

// Your finished product will be a page where the user can enter a
// domain, specify a metric from the drop down, and optionally specify
// a date range or the last x months from which to gather data.  When
// they click the GO button, a chart should appear.  Additionally, the
// user should be able to change these inputs and load a different
// chart WITHOUT refreshing the page.

// This is probably the only file you will edit.  You are welcome to
// create and modify as many new files as you want, but it is
// strongly advised that you do not modify index.html or
// highcharts-custom.js.  index.html is pre set up enough that you can
// complete the test without changing it.  You will of course need to
// carefully review index.html throughout the test as it contains the
// dom elements you will need to either manipulate or read values
// from.  If you do end up modifying index.html, you may not do so to
// add script tags for external JavaScript libraries like jQuery.  At
// Idea Evolver, we try to use jQuery as little as possible because it
// is large to load and has much worse performance than raw JS.

// The documentation for Compete.com is located here: https://developer.compete.com/documentation/

// Jump to the very bottom of the documentation page.  Read the
// section about JSONP carefully because that is how you will request
// data from Compete.  Unfortunately, there is a small error in the
// sample code for JSONP, but an ace coder fit to work at Idea Evolver
// should be able to figure it out anyway :)

// The API Key for Compete is #########################

// Feel free to ask lots of questions and think aloud.

var timeOutInMilliseconds = 5000;

var goButton = document.getElementById('go');

var chartContainer = document.getElementById('container');
chartContainer.style.textAlign = 'center';

var metricDropDown = document.getElementById('metric');
var domainInput = document.getElementById('domain');

var startDateInput = document.getElementsByName('start_date')[0];
var endDateInput = document.getElementsByName('end_date')[0];
var latestInput = document.getElementsByName('latest')[0];

//this variable prevents a user spamming the go button
var wasGoAlreadyClicked = false;
var didCompeteJSONLoad = false;

var domainName;

var script = null;

document.getElementById('clearStartEnd').addEventListener("click", function() {
    startDateInput.value = null;
    endDateInput.vaule = '';
    endDateInput.value = null;
});

document.getElementById('clearLatest').addEventListener("click", function() {
    latestInput.value = null;
});

goButton.addEventListener("click", function() {
    callCompeteAPI();
});

function competeCallback(competeJSON) {
    didCompeteJSONLoad = true;
    script = null;
    document.getElementsByTagName('head')[0].removeChild(script);

    wasGoAlreadyClicked = false;

    if (competeJSON.status == 'NO_DATA') {
        chartContainer.innerHTML = '<h2 style="color: red">No data for this site.</h2>';
    }
    else if (competeJSON.status == 'ACCESS_DENIED') {
        chartContainer.innerHTML = '<h2 style="color: red">' + competeJSON.status_message + '</h2>';
    }
    else {
        makeChart(competeJSON, metricDropDown.options[metricDropDown.selectedIndex].text, metricDropDown.value, domainName)
    }
}

function callCompeteAPI() {
    //pull host name from input, ie http://facebook.com becomes facebook.com
    domainName = domainInput.value.match(/([a-z0-9-.]*)\.([a-z]{2,4})/);

    if (!domainName) {
        chartContainer.innerHTML = '<h2 style="color: red">please enter a valid domain<br>for example: facebook.com</h2>';
    }
    else {
        domainName = domainName[0];

        if (!wasGoAlreadyClicked) {
            //no options specified
            var url = 'https://apps.compete.com/sites/' + domainName + '/trended/' + metricDropDown.value + '?apikey=e9c9f3a3bec91fd033f7a3d3d39c3b1d&jsonp=competeCallback';

            //specified date
            if (startDateInput.value && !latestInput.value) {
                var currentDate = new Date();
                var endYear, endMonth;

                var startYear = parseInt(convertDateToYear(startDateInput.value));
                var startMonth = parseInt(convertDateToMonth(startDateInput.value));
                if (endDateInput.value) {
                    endYear = parseInt(convertDateToYear(endDateInput.value));
                    endMonth = parseInt(convertDateToMonth(endDateInput.value));
                }
                else {
                    endYear = currentDate.getFullYear();
                    //add one to get month because it starts at 0 rather than 1
                    endMonth = currentDate.getMonth() + 1;
                }

                //check that the start date is in the past and end date is larger than start date
                if (endYear - startYear < 1 || currentDate.getFullYear() == startYear) {
                    if (endMonth - startMonth < 1 || currentDate.getMonth() + 1 - startMonth < 1) {
                        chartContainer.innerHTML = '<h2 style="color: red">your dates don\'t work</h2>';
                        return;
                    }
                }

                //convert int < 10 to string month, ie 3 becomes '03'
                if (startMonth < 10) {
                    startMonth = '0' + startMonth;
                }

                if (endMonth < 10) {
                    endMonth = '0' + endMonth;
                }

                url += '&start_date=' + startYear + startMonth + '&end_date=' + endYear + endMonth;
            }
            //latest
            else if (!startDateInput.value && !endDateInput.value && latestInput.value) {
                url += '&latest=' + latestInput.value;
            }
            //error,
            else if ((startDateInput.value || endDateInput.value) && latestInput.value) {
                chartContainer.innerHTML = '<h2 style="color: red">please specify start and end dates<br>OR<br>latest number of months</h2>';
                return;
            }

            wasGoAlreadyClicked = true;

            chartContainer.innerHTML = '<div style="text-align: center"><img src="images/hexLoader.gif"><h2>Loading...</h2></div>';

            didCompeteJSONLoad = false;

            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);

            setTimeout(function () {
                if (!didCompeteJSONLoad) {
                    chartContainer.innerHTML = '<h2 style="color: red">the data could not be fetched</h2>'
                }
            }, timeOutInMilliseconds);
        }
    }
}

function makeChart (data, metricName, metricCode, domain) {
    // Params:
    // `data` - the raw data Compete gives you after the JSONP request
    // `metricName` - a name from the Metric drop down.
    // `metricCode` - the corresponding value denoted in each metricName <option>
    // `domain`  -  the domain of interest.
    
    // This function is used to create the Highcharts graph with the
    // data you retrieve from Compete.
    
    // Don't try to understand this function.  Just give it the right
    // inputs and it will create the chart and render it into the page
    // for you.

    function getUTC(datestring){
        return Date.UTC(datestring.substring(0,4), datestring.substring(4)-1);
    }
    var met = data.data.trends[metricCode];
    //console.log(met);
    var firstdate = met[0].date;
    var year = parseInt(firstdate.substring(0,4));
    var month = parseInt(firstdate.substring(4));
    new Highcharts.Chart({
        chart:{
            renderTo:'container',
            type:'area',
            zoomType:'x',
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -24
                }
            },
            borderRadius: 0,
            backgroundColor: 'rgba(255, 255, 255, 0)',
            spacingTop: 10,
            spacingBottom: 5,
            spacingRight: 5,
            spacingLeft: 5
        },
        title:{
            text:metricName + ' at ' + domain,
            style: {
                color: 'rgba(2, 50, 71, .9)',
                fontSize: '24px',
                fontFamily: '\'Montserrat\''
            }
        },
        legend: {
            verticalAlign:"top",
            y:30,
            backgroundColor: 'rgba(196, 195, 195, .03)',
            borderColor: 'rgba(249, 174, 57, .3)'
        },
        tooltip: {
            shared: true,
            crosshairs: true
        },
        credits: {
            enabled: false
        },
        xAxis:{
            type:'datetime',
            minRange:14*24*3600000,
            lineWidth: 1,
            labels: {
                style: {
                    color: 'rgba(2, 50, 71, .85)',
                    fontSize: '11px',
                    fontFamily: 'Montserrat'
                }
            }
        },
        yAxis:{
            title:{
                text:metricName
            }
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false
                },
                lineWidth: 1,
                lineColor: 'rgba(2, 50, 71, .75)',
                shadow: false,
                states: {
                    hover: {
                        enabled: false
                    }
                },
                stacking:'normal'
            },
            spline: {
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 5
                        }
                    }
                },
                lineWidth: 2,
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        series:[{
            type:'area',
            name:metricName,
            pointInterval:30*24*3600*1000,
            pointStart: Date.UTC(year, month-1),
            data:met.map(function(e){return [getUTC(e.date), parseFloat(e.value)];})
        }]
    });
}

 //  Utility Functions   \\
//========================\\

function convertDateToYear(date) {
    return date.match(/\d{4}/);
}
function convertDateToMonth(date) {
    return date.match(/-\d{2}/)[0].replace("-", "");
}