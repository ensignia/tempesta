---
title: Layers
component: ContentPage
---
It may seem odd that we are starting with forecasting in a discussion of chasing -- why not talk about storm structure or how to chase first?

The rationale that the underlying themes we will cover over the next few posts are the theoretical framework from which we understand tornadoes and other severe phenomena. Covering how to decide which days will produce severe weather helps us to understand what makes severe storms severe.

With that in mind, we will be talking about wind shear, and it will be covered from a largely theoretical viewpoint, because it is important to understanding why a specific set up or storm is behaving as it is.

Meteorologists really like to use the words "wind shear" when talking about severe weather because it dictates, in part, what kind of weather will occur. The quality of shear present can dictate the difference between a day with discrete supercells favorable for tornadoes and a bow echo event. Exactly how to forecast this will be covered in a future post.

Shear, for our purposes, is changes with wind with respect to height above the surface. For now, we will cover the primary types of shear, and talk about how they contribute to severe weather.

The first kind of shear is speed shear. This is caused by a difference in wind speed at different heights.

Instead of going into a discussion of the mathematics, I want you to find a pen or pencil, and put it between the palms of your hands. Move the top hand along the pencil. You'll see the pencil rotates.

This is effectively how speed shear works -- a layer of air moving faster relative to a layer moving more slowly above or below it will create an area of spin oriented along a horizontal axis (like the pencil).

This is important to forecasting severe weather, because rotations like this play an important role in creating the storms we that interest us.

It may be counter-intuitive how a horizontally oriented vortex tube (think of the pencil as a tube -- any point on the pencil rotates similarly) can produce a vertically oriented rotating phenomena like a tornado.

The answer lies in the idea of vortex tilting, and while it is not complete, it certainly plays an important role in tornadogenesis, the formation of tornadoes.

I made this diagram to illustrate the process.

Speed shear will also tilt a storm's updraft. This allows the updraft and downdraft to occur in separate regions of the storm. As a result, the downdraft will not cut-off the updraft and actually it will even reinforce it. This is critical in the formation of supercells as well as hail.

I made this diagram to illustrate how this works.

The second type of shear is directional shear, which is a change in the direction of wind with height.

So if the wind is from the south at the surface, and higher up in the atmosphere, maybe they are from the west, this would represent an area of directional shear.

The main reason we are concerned with this kind of shear is that it helps updrafts to start rotating as they form, which helps to make supercells and mesocyclones, which are the parent systems of tornadoes, and the storms we traditionally chase.

This can be used in identifying warm and cold air advection, which we'll cover later.

Even more importantly, certain kinds of directional shear (called veering winds) are particularly favorable for tornado development. We'll talk about identifying these in the future.

In the field, a rotating updraft might look like this.

In general, shear will show up in three 'parameters' when you are forecasting: hodographs, storm relative helicity, and bulk shear. We'll cover these later, once we finish building up a theoretical framework.

Glossary of terms used

Advection: Physical movement of some existing variable (temperature, moisture, momentum, vorticity, etc) by wind. Think of it like leaves on top of a flowing river

Bow Echo: Multicellular storm system organized into a line that bows (like a bow and arrow). They are associated with very damaging winds near the apex of the bow.

Discrete supercell A type of thunderstorm which is dominated by a deep, persistently rotating updraft. The thunderstorm exists independently of other cells, and has the potential to be the most severe of any kind of thunderstorm. Most tornadoes form from supercells.









This starts the next major section of Chasing 101. So far, we have effectively covered an introduction to the wind environment, looking at shear, hodographs, and helicity. This is the major ingredient in why some storms are severe and some are just garden-variety thunderstorms.

Still, winds alone do not make a thunderstorm, let alone a supercell, so we turn our attention towards instability. These next few sections will help us understand and predict convection -- thunderstorms -- created by thermodynamic processes. Normally, we call this convective instability

Probably the only measure of convective instability that most beginning chasers use today is called CAPE, or convective available potential energy. When you are reading forecast discussions or on forums, you will find a lot of conversation about CAPE -- most chasers chose this measure as the heart of their forecast. This makes some sense -- once you understand it, it is easy to use and a powerful forecast tool.

Still, a caveat -- CAPE is one of the last things I'm likely to look at -- the synoptic set up, shear environment, mesoscale considerations -- these dictate my forecast more. CAPE alone doesn't tell the whole story. I think a lot of amateur chasers (myself at one point too) focus on CAPE and lose sight of a lot of other factors. This ties us to the models and makes us lose sight of the larger picture. This can lead to busted forecast or overconfidence in a marginal situation.

Warm air is less dense than cold air. You can prove this to yourself with the ideal gas law (p=ρ•Rd•T) At a constant pressure and Rd (a constant by it's nature) the only variables are temperature and density (ρ). Since they are on the same side of the equation, a rise in one must mean there is a fall in the other to keep pressure constant -- that is, higher temperatures mean lower densities.

We also have to introduce an ideal called an air parcel -- think about it as a 'blob' of air that is different than the air around it. It has a specific identity, but it can be modified by physical processes or environmental changes.

I made a rudimentary animation explaining CAPE. Watch it, because it is better than writing out an explanation.

To explain what is happening in the animation, let's go through what the numbers associated with CAPE actually mean by doing a bit of a thought experiment.

We know that air that is colder than the environment sinks and warmer than the environment rises (per our density example above). Differences in density are what drives buoyancy -- just like oil and water. The same principle works in a hot air balloon. The more different the densities, the more the two will want to separate -- the more "lift" there will be.

On our temperature diagram, the more apart the line for our parcel and the environment are, the more different their densities -- the more energy is present due to buoyancy. If we take a snapshot of any one horizontal line, we will see just how different the two lines are. Anywhere that the environment is warmer is going to inhibit convection, so we label it CIN. We add up all the areas (read: integrate) with this negative to get a total number for CIN.

Likewise, anywhere the parcel is warmer than the environment, we give a positive number. We sum up all the touching positive numbers, and that number is CAPE.

Luckily, we have computers, and they do all this for us. Of course, if we just treat CAPE as a magic number, we don't understand why it is important. Understanding where the number comes from is a way to make your forecasts better.

You will find there are all different kinds of CAPE -- surface based, lowest 100m above ground level, mixed level, elevated, downdraft -- the list goes on and on. Don't fret for now about their distinctions. As you go into the field the first few times, just using max CAPE is probably enough. I suppose it is worth noting that we measure CAPE in J/kg.

Using yesterday's tornado outbreak as an example, let's look at what a map of CAPE looks like on twisterdata. You can see this roughly correlates with the area of storms.

CAPE values can be between several hundred to several thousand -- it is dependent on lots of factors, namely moisture and temperature right near the surface and how the environmental profile looks. So just the number of CAPE - without more analysis - is a relatively weak forecast parameter. Used correctly, though, it is among the most powerful.

This is because, in reality, CAPE is heavily tied to a meteorological, thermodynamic diagram called a Skew-T, or a sounding. These are quite complex, and we will cover them later. My little .gif above is a rudimentary diagram -- but a real one looks like this.

Understanding how these soundings work is probably the most important tool in forecasting instability -- and we'll talk about that in the next couple lessons.

For now, CAPE should be a nice measure of points where convection is possible -- and CIN should be areas where convection might be prevented. Almost always on a chase day the two overlap, and predicting when the CIN will disappear and allow CAPE to be used is a normal forecast challenge.

glossary of terms used

Skew-T sounding one way of plotting the raw data from a balloon launching, showing how winds, temperature, and dew point vary with height. Many calculations, including CAPE, finding the height of the cloud base, finding convective temperatures, analyzing the cap, and more can be performed using this diagram. In the end, the skew-t will become the anchor of your forecasting, and will be covered soon.
