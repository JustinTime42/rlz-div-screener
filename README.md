# rlz-div-screener
screener based on 78.6 rlz and volume divergence

This screener will check coins where there is price/volume divergence at low end of ranges. 
Right now, low end of range simply means <78.6% of total all-time range. 
* Todo: create better range algorithm

To determine falling price, it checks that the past 18 day average is higher than the past 6 day average. 

To determine rising volume, it checks that the past 18 day volume is lower than the past 6 day average. 

I'm tweaking the period length and investigating other algorithms for that. 

Once I have the first iteration of this running, I'll build a front-end that will display and chart the identified coins. 
