import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  getAxisYDomain,
} from "recharts/umd/Recharts";
import _ from "lodash";

const Charty = () => {
  const [data, setData] = useState([]);
  const [yMax, setYmax] = useState(0);
  const [yMin, setYmin] = useState(0);

  useEffect(() => {
    const minValue = _.min(data.map((d) => d.binanceAsk)) * 0.999;
    const maxValue = _.max(data.map((d) => d.binanceAsk)) * 1.001;

    setYmin(minValue);
    setYmax(maxValue);

    const fetchData = async () => {
      // Fetch ask and bid prices from Binance and Coinbase
      const [binanceData, coinbaseData] = await Promise.all([
        fetch(
          "https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT"
        ),
        fetch("https://api.pro.coinbase.com/products/BTC-USD/ticker"),
      ]);

      // Extract ask and bid prices from the response data
      const binance = await binanceData.json();
      const coinbase = await coinbaseData.json();
      const binanceAsk = binance.askPrice;
      const binanceBid = binance.bidPrice;
      const coinbaseAsk = coinbase.ask;
      const coinbaseBid = coinbase.bid;

      // Add the data to the chart data array
      setData([
        ...data,
        {
          time: Date.now(),
          binanceAsk,
          binanceBid,
          coinbaseAsk,
          coinbaseBid,
        },
      ]);
    };

    // Fetch data every 5 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <LineChart
      width={1280}
      height={680}
      margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
      data={data.slice(-100)}
    >
      <Line
        type="monotone"
        dataKey="binanceAsk"
        stroke="#8884d8"
        tickFormatter={(value) => value.toFixed(2)}
      />
      <Line
        type="monotone"
        dataKey="binanceBid"
        stroke="#82ca9d"
        tickFormatter={(value) => value.toFixed(2)}
      />
      <Line
        type="monotone"
        dataKey="coinbaseAsk"
        stroke="#ffc658"
        tickFormatter={(value) => value.toFixed(2)}
      />
      <Line
        type="monotone"
        dataKey="coinbaseBid"
        stroke="#ff7300"
        tickFormatter={(value) => value.toFixed(2)}
      />
      <XAxis
        dataKey="time"
        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
      />
      <YAxis
        tickFormatter={(value) => value.toFixed(2)}
        domain={[yMin, yMax]}
      />
    </LineChart>
  );
};

export default Charty;
