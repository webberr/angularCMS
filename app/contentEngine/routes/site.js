/*
 * Serve JSON to our AngularJS client
 */

var content = {
    "id":"1",
    "owner":"Chris Mullin",
    "name":"Paradigm Construction, LLC",
    "host":"",
    "port":80,
    "site":
    {
        "url":"paradigmconstruct.com",
        "title":"Paradigm Construction, LLC",
        "meta":"",
        "icon":"",
        "logo":"",
        "slogan":"Construction with Integrity",
        "images":"",
        "admin":"admin@paradigmconstruct.com",
        "contact":"cmullin@paradigmconstruct.com",
        "copyright":2013,
        "version":0.1,
        "pages":6,
        "pagecontent":[
            {
                "title":"home",
                "header":"Marketing stuff!",
                "template":"home",
                "content":"Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."
            },
            {
                "title":"company",
                "template":"basic",
                "content": "Paradigm Construction, LLC. was established in April 2009 during a deep recession as a means for Owner Chris Mullin to get back to work in a difficult job market.  At the time, Chris was two months removed from his last position as a Project Manager for another reputable contractor at the end of an 11 year career working for medium to large commercial general contractors in the Portland, Oregon metropolitan area."		},
            {
                "title":"services",
                "template":"basic",
                "content":"Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus."
            },
            {
                "title":"projects",
                "template":"basic",
                "content":"Coming Soon..."
            },
            {
                "title":"bids",
                "template":"basic",
                "content":"There are no bid opportunities at this time."
            },
            {
                "title":"contact",
                "template":"contact",
                "content":"contact us"
            }
        ]
    }
}

exports.content = function (req, res) {
  res.json(content);
};