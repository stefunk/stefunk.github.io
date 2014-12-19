---
layout: post
title: Inline critical CSS to solve the "Above the fold issue"
---

I recently reviewed the front-end code of a mid size website.  
The goal was trying to get the best performance as possible, according to [Page Speed Insights](https://developers.google.com/speed/pagespeed/insights/).  
I hadn't the full control of the webserver and I cannot install the [mod_pagespeed](https://developers.google.com/speed/pagespeed/module) module, so I had to fix all the suggestion from Page Speed by myself.

Fortunately the code was well written and the only problem I had to face was the **Above the Fold issue**:

> None of the above-the-fold content on your page could be rendered without
> waiting for the following resources to load. Try to defer or asynchronously load
> blocking resources, or inline the critical portions of those resources directly
> in the HTML.

The first step was to discover the real meaning of "above-the-fold content".  
As from [Wikipedia definition](http://en.wikipedia.org/wiki/Above_the_fold):

> Above the fold is sometimes used in web development to refer the portions of a
> webpage that are visible without scrolling.

After reading the official Google Developers page ["Optimize CSS Delivery"](https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery)
and searching for other devs articles, I got more clear in my mind how to face this problem:

**Critical  CSS** are a subset of the stylesheet rules wrote for your website/SPA, that can guarantee the correct rendering of the **above the fold contents**. They have to be inlined in your ``<head>`` while the rest of your CSS could be easily loaded async.



## Steps

* Identify the critical CSS for a page
* Extract them to a *critical.css* stylesheet
* Inject them inside the right page
* Async load of the *non-critical.css*
* Discover a way to keep the above points automated


### Identify and extract
In order to get an immediate answer to the question *"what are the critical css for this page?"* you can use this two choice:

+ A [bookmarklet](https://gist.github.com/PaulKinlan/6284142) by Paul Kinlan
+ An [online tool](http://jonassebastianohlsson.com/criticalpathcssgenerator) based on [Pentahouse](https://github.com/pocketjoso/penthouse)

Very fast, but useful only to have a better understanding of our problem.
We need something different to automate the process.

From Addy Osmani [Above the Fold tools list](https://github.com/addyosmani/above-the-fold-css-tools) we discover three very useful tools:

+ [Penthouse](https://github.com/pocketjoso/penthouse) by Jonas Ohlsonn
+ [Critical](http://github.com/addyosmani/critical) by Addy Osmani
+ [CriticalCSS](https://github.com/filamentgroup/criticalcss) by Filament Group

All these great tools will help you discover and extract the css you need. Penthouse and Critical comes also as **Grunt task**.


### Inject them in the right page
After you are able to exctrat your critical CSS rules you have to inject them directly in your views.
The only tools (from the list above) that do this job is Critical by Addy Osmani. If you chosed one of the others you have to find another solutions:

+ [Inline styles](https://github.com/maxogden/inline-styles) by Max Ogden
+ [Grunt inline sources](https://github.com/fmal/gulp-inline-source) by Filip Malinowski


### Async load of the *non*-critical CSS
Ok, we had inlined our rules for the above the fold contents, but if we scroll the rest of the page is completely unstyled! And also we cannot re-add our external CSS in the ``<head>`` cause it will be again **render blocking**.  
The first idea could be to put our ``<link>`` at the end of the ``<body>`` as you do with the js library.  
I decided to go for a more interesting way: load all the non-critical CSS asynchronously using the [LoadCSS](https://github.com/filamentgroup/loadCSS) utility.  

Et voilà:

```javascript
<head>
...
<script>
// include loadCSS here...
function loadCSS( href, before, media ){ ... }
// load a file
loadCSS( "path/to/mystylesheet.css" );
</script>

<!-- Disabled Js fallback -->
<noscript>
<link href="path/to/mystylesheet.css" rel="stylesheet">
</noscript>
...
</head>
```

(This example is taken from LoadCss Github).


### Automate! Automate! Automate!
Now, it's time to let this baby process grow into a robot.
I decided to use **Grunt** to automate all the steps, using also other contrib-tools.

My final steps:

1. Retrieve the html fixtures of the page to analyze using PhantomJS.
+ Extract the critical CSS from them.
* Inject the new stylesheet created.
* Inject the loadCss script with the right array of files to load.


That's all. Hope you'll find this article useful!
