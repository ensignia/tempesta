---
title: Models
component: ContentPage
---

<div style="text-align: justify;">
While understanding what other meteorologists are saying is critical and almost certainly will be the foundation 
of your own chasing forecast, it is also imperative that you have at least rudimentary forecasting skills if you do 
not want your chasing to be reactionary (that is, waiting for a warning to jump into action).

Forecasting is an art and a science, and it takes a long time to truly learn -- it depends on intricacies -- 
down to the kind of crops, where lakes and hills are, winds left over from thunderstorms a thousand miles away the 
day before -- lots and lots of data. The good news is that we have ways to get lots and lots of data quickly.

Specifically, we use different instruments: weather satellites, radar, thousands of surface observations, and, most 
importantly, vertical soundings of the atmosphere made by weather balloons. All this data is diagnostic -- it 
tells us about the state of the atmosphere as it is now. Even better news is that we have computer models, 
sets of formulas and assumptions that use this diagnostic information to help make forecasts much more accurate. 
Models take all this data in, and they form a picture of the atmosphere at the current time, called the analysis frame. 
Once they have done that, they run many, many calculations to make a prognostic forecast -- to see how these initial 
conditions may behave at some point in the future.

These models are very, very complex, and are generally run on some of the most powerful computers in the world. 
Even so, these models normally take hours to run through all the calculations. Each time a new set of initial 
conditions is used, the prognostic forecast will change -- so we call each iteration of the model a run. Sometimes, 
you will see the phrase prog used its place, or as a stand in for the word forecast. Normally, there will be 4 our 
more runs per day of any given model -- so new data is pretty much at hand.

As an amateur forecaster, these models will be the absolute cornerstone of your forecast workflow. That will limit, 
in some ways, your ability to make the best forecast, but in terms of time invested, it is by far the best option. 
Using experts alongside the models is an excellent way to make a great forecast for your own chase. With that in mind, 
let's talk briefly about the three models you are likely to use or encounter, what they are used for, and where you can find their outputs.

The first is the **Global Forecast System**, or the **GFS**. This, as its name suggests, is a model which covers the globe. 
It also is a long-range model, forecasting up to 16 days in the future. This comes at the cost of resolution both 
temporally (time between each frame of the model) and spatially (the physical size of 'pixels'). Because the GFS is 
such a long term model, you will use it mainly to identify setups in the coming days. There are other long term models 
(ECMWF, GEM, etc), but their outputs are harder to find, so we will focus on the GFS for now. In general, this is 
where the convective outlooks from the SPC will aid you -- and other discussion forums will help. 
You probably won't use this as much as the other models the day of the chase, though that is certainly not always the 
case. Notably, the GFS helps to be a judgement tool of the performance of other models. By comparing 
the models, you can see how well each is doing relative to the others. Low variability between different models 
is a good sign the computers are doing well forecasting a situation.

The other model we are going to discuss is the **High Resolution Rapid Refresh**, or **HRRR**. As you might have guessed, 
this model has the highest resolution, temporally and spatially, of the three. It produces a run every hour, 
and forecasts for the next 16 hours in one hour increments (and for some parameters every 15 minutes!). It also has 
extremely high spatial resolution, on the order of 4km. The HRRR is in part another form of the WRF. The HRRR is 
extra cool in that it takes in radar data as the heart of it's modeling, and resolves data at the scale of individual 
storms itself. This makes it very different from the NAM and the GFS. 
It also outputs data that is very easy to use -- data like simulated radar maps and maps of the most likely 
areas for convective initiation, for instance.

All this makes it amazingly valuable in chasing, and it is the tool that, if you learn to use properly, that I 
think will increase your chase forecasts the most. As such, a whole post will be dedicated to it in the future.
A note about time in meteorology. Often, the features we study cover many time zones. This gets confusing fast, so 
we use Greenwich Mean Time (GMT)/Coordinated Universal Time (UTC)/Zulu time (Z). These are all the same time, and use 
a clock in England as the basis of the time.

It is the same time GMT at all points across the globe. So if it is 18Z, it is 18Z in Russia, the US, and Uganda, 
everywhere. This is very helpful, but it isn't the most intuitive. Complicating things more, it is always in 24 hour 
format, which you probably don't use daily. Further, things like daylight savings time add another twist.

To get your local time, you add or subtract a number of hours. In the US, we subtract. In central standard time, 
the time used across most of tornado alley, we subtract 6 hours or 5 hours if daylight savings time is in effect. 
This is a little counter-intuitive, but it is imperative to using models well, since all the timestamps on models are in UTC. With a little practice, it will come naturally. If how I said it is confusing, a quick Google search should clear things up for you.

There are lots of other models, but this app uses these two.


Glossary of terms used

1. **Mesoscale** - Pertaining to atmospheric phenomena having horizontal scales ranging from a few to several hundred 
kilometers, including thunderstorms, squall lines, and fronts. [ams]
2. **Resolution** - The temporal and spatial scale of data. High resolution data tends to cover a limited domain as a 
result of computing limitations or physical costs.
3. **Sounding** - The data produced from (normally) a weather balloon launch that gives the vertical profile of wind, 
temperature, and moisture in the atmosphere. These are invaluable in evaluating stability, and will be covered in depth later.
</div>