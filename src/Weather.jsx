import React, { useState, useEffect } from 'react';
import axios from 'axios';
import clearImage from './images/clear.jpg';
import mistImage from './images/mist.jpg';
import rainImage from './images/rainy.jpeg';
import overcastImage from './images/overcast.jpg';
import sunnyImage from './images/sunny.jpg';
import thunderstormImage from './images/ThunderStrom.jpg';
import cloudyImage from './images/cloudy.jpg';
import brokenCloudsImage from './images/broken-clouds.jpg';
import hazeImage from './images/haze.jpg';
import defaultImage from './images/background.jpg';
import './App.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(defaultImage);
  const [textColor, setTextColor] = useState('black');

  const apiKey = '0dd76a57bcbfc398c783e32ad0ccabf8';

  const getWeather = async () => {
    try {
      setError(null);
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      const data = response.data;

      // Set weather data in state
      setWeather(data);
      setBackgroundImageBasedOnCondition(data.weather[0].description.toLowerCase());

      // Send the fetched data to the backend to store in MongoDB
      await axios.post(`${import.meta.env.VITE_APP_API_KEY}/Weather`, { city, data });
    } catch (err) {
      setError('City not found. Please enter a valid city name.');
      setWeather(null);
    }
  };

  const setBackgroundImageBasedOnCondition = (condition) => {
    switch (condition) {
      case 'clear sky':
        setBackgroundImage(clearImage);
        break;
      case 'mist':
      case 'fog':
        setBackgroundImage(mistImage);
        break;
      case 'light rain':
      case 'moderate rain':
      case 'heavy intensity rain':
        setBackgroundImage(rainImage);
        break;
      case 'overcast clouds':
        setBackgroundImage(overcastImage);
        break;
      case 'sunny':
        setBackgroundImage(sunnyImage);
        break;
      case 'thunderstorm':
        setBackgroundImage(thunderstormImage);
        break;
      case 'broken clouds':
      case 'scattered clouds':
        setBackgroundImage(brokenCloudsImage);
        break;
      case 'haze':
        setBackgroundImage(hazeImage);
        break;
      case 'cloudy':
        setBackgroundImage(cloudyImage);
        break;
      default:
        setBackgroundImage(defaultImage);
        break;
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const brightness = calculateImageBrightness(imageData.data);
      setTextColor(brightness < 128 ? 'white' : 'black');
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  const calculateImageBrightness = (imageData) => {
    let brightness = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      brightness += imageData[i] * 0.299 + imageData[i + 1] * 0.587 + imageData[i + 2] * 0.114;
    }
    brightness = brightness / (imageData.length / 4);
    return brightness;
  };

  return (
    <div className="weather-container" style={{ 
      backgroundImage: `url(${backgroundImage})`,
      color: textColor
    }}>
      <h1>Weather App</h1>
      <div className="input-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="city-input"
        />
        <button onClick={getWeather} className="get-weather-btn">Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Description: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
