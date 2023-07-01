**Note: Algotrading is possible only in highly liquid instruments.
Avoid placing orders in rush hours(market opening i.e. 9:15).**
So if any entry or exit signal is generated at 9:15 then it must be fulfilled after 5 min candle close.

# List of Todo's
The list of items to be picked.

## Improvements
---

* ### User Registation and Authentication
    - Send user registration email (5)
    - Verify email (3)
    - Forgot Password (2)
    - Implement TOTP (1)
    - ~~Operation/Admin Panel (1)~~
    - ~~Validate all api calls (route guard)~~

* ### Dashboard
    - ~~Show active menu.~~
    - Design change use some template.

## Features
---
* ### User Settings
    - Show current logged-in sessions.
    - Subscription model
    - Add payment method

* ### Algos
    - ~~Client registration~~
    - ~~Client status check~~
    - ~~Make Client active only if state has enbaled.~~
    - ~~Register Strategies (2)~~
    - ~~Virtual Trade with registered bot using available strategies~~
    - Fresh trades in next expiry if its thrusday 
    - WS Connection drop in between (fix this)
    

Apps
Trading user Portal 
Algo server 
WS server for collecting Analytics and for rolling window.
Shared database


Architecture 


Trradingview Signal 
    ----> Check subscription and trigger the strategy



Rolling window for maximum profit
    ----> Restart websocket server.
    ----> Subscribe to websocket
        ----> Push data to kafka server(for failover) ----> InfluxDB to collect trading position's tikcer
