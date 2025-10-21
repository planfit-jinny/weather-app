import { WEATHER_API_KEY } from '@env';
import * as Location from 'expo-location';
import "expo-router/entry";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WeatherDescKo } from './WeatherDescKo';
import { FontAwesome6, Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const weatherApiKey = WEATHER_API_KEY;

// 날씨 상태에 따른 그라디언트 색상
const getWeatherGradient = (weatherId: number): string[] => {
  if (weatherId >= 200 && weatherId < 300) {
    // 천둥번개
    return ['#283048', '#859398'];
  } else if (weatherId >= 300 && weatherId < 600) {
    // 비
    return ['#4CA1AF', '#C4E0E5'];
  } else if (weatherId >= 600 && weatherId < 700) {
    // 눈
    return ['#E0EAFC', '#CFDEF3'];
  } else if (weatherId >= 700 && weatherId < 800) {
    // 안개, 흐림
    return ['#757F9A', '#D7DDE8'];
  } else if (weatherId === 800) {
    // 맑음
    return ['#56CCF2', '#2F80ED'];
  } else {
    // 구름
    return ['#bdc3c7', '#2c3e50'];
  }
};

type DailyWeather = {
  dt: number;
  temp: { day: number };
  weather: {
    main: string;
    description: string;
    icon: string;
    id: number;
  }[];
  wind_speed: number;
  humidity: number;
  pressure: number;
  // 필요하다면 더 추가
};

const WeatherDesc = ({ day }: { day: DailyWeather }) => {
  const id = day.weather[0].id;
  const match = WeatherDescKo.find(item => item.id === id);
  const desc = match?.desc ?? day.weather[0].description ?? "알 수 없음";
  const iconName = match?.icon ?? "question";

  return (
    <View style={styles.weatherDescContainer}>
      <Fontisto
        name={iconName as any}
        size={80}
        color="rgba(255, 255, 255, 0.95)"
        style={styles.weatherIcon}
      />
      <Text style={styles.weatherLabel}>{desc}</Text>
    </View>
  );
};


const App = () => {
  // const [location, setLocation] = useState(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [permitted, setPermitted] = useState(true);
  const [dailyWeather, setDailyWeather] = useState<DailyWeather[]>([]);


  const locationDate = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();

      if (!granted) {
        setPermitted(false);
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // const currentLocation = await Location.getCurrentPositionAsync({
      //   accuracy: Location.Accuracy.Highest
      // });
      // setLocation(currentLocation);
      // console.log("📍 위치 정보:", currentLocation);

      // const { latitude, longitude } = currentLocation.coords;

      // const address = await Location.reverseGeocodeAsync(
      //   { latitude, longitude },
      // );

      // 하드 코딩된 위치 정보
      const hardcodedLatitude = 37.55209180417618; // 예시: 서울 위도
      const hardcodedLongitude = 126.9173836945658; // 예시: 서울 경도

      const hardcodedLocationObject: Location.LocationObject = {
        coords: {
          latitude: hardcodedLatitude,
          longitude: hardcodedLongitude,
          altitude: null,       // 필요한 경우 실제 값으로 대체
          accuracy: null,      // 필요한 경우 실제 값으로 대체
          altitudeAccuracy: null, // 필요한 경우 실제 값으로 대체
          heading: null,       // 필요한 경우 실제 값으로 대체
          speed: null,        // 필요한 경우 실제 값으로 대체
        },
        timestamp: Date.now(), // 현재 타임스탬프
      };

      setLocation(hardcodedLocationObject); // 하드 코딩된 위치로 상태 업데이트
      console.log("📍 하드 코딩된 위치 정보:", hardcodedLocationObject);


      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });

      // 하드 코딩된 위치로 주소 정보 가져오기
      // const address = await getAddressFromCoords(hardcodedLatitude, hardcodedLongitude);
      // setCity(address);
      setCity('서울특별시');


      // Hardcoded Seoul
      // setLocation({ latitude: 37.55209180417618, longitude: 126.9173836945658 });



      const weatherAppUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&units=metric&lang=kr&appid=${WEATHER_API_KEY}`;
      const resToWeather = await fetch(weatherAppUrl);
      const jsonForWeather = await resToWeather.json();

      if (Array.isArray(jsonForWeather.daily)) {
        setDailyWeather(jsonForWeather.daily);
      } else {
        setDailyWeather([]);
        setErrorMsg('날씨 데이터(daily)가 없습니다.');
      }
      // console.log('API 응답:', jsonForWeather);


      // console.log("🔑 API KEY:", WEATHER_API_KEY); // 이거 찍어봐!

      // setDailyWeather(weatherData.daily);

      // console.log("📫 주소 정보:", address[0].city);r
      // const cityAddress = address[0].city;
      // // setCity(cityAddress);

    } catch (error) {
      setErrorMsg(`Error fetching location/weather: ${error}`);
      console.error("🚨 에러 발생:", error);
    }
  };

  const date = new Date(); // Date 객체 생성
  // console.log(date); // 원시 Date 객체 출력
  
  const options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  
  const dateString = date.toLocaleDateString('ko-KR', options);
  console.log(dateString); // 한국어 포맷된 날짜 출력



  useEffect(() => {
    locationDate(); // ✅ 반드시 이 안에서 호출
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.weather}
      >
        {dailyWeather.length === 0 ? (
          <LinearGradient
            colors={['#56CCF2', '#2F80ED']}
            style={[styles.weatherInner, { justifyContent: 'center', alignItems: 'center' }]}
          >
            <ActivityIndicator size="large" color="white" />
          </LinearGradient>
        ) : (
          dailyWeather.map((day) => {
            const date = new Date(day.dt * 1000);
            const dateString = date.toLocaleDateString('ko-KR', {
              month: "long",
              day: "numeric",
              weekday: "long",
            });
            const n = date.getDate();
            const daySuffix = (n >= 11 && n <= 13) ? 'th' : ['st', 'nd', 'rd'][n % 10 - 1] || 'th';
            const weekDayText = `${n}${daySuffix}`;
            const gradientColors = getWeatherGradient(day.weather[0].id);

            return (
              <LinearGradient
                colors={gradientColors}
                style={styles.day}
                key={day.dt}
              >
                <View style={styles.topSection}>
                  <Text style={styles.city}>{city}</Text>
                  <Text style={styles.regDate}>{dateString}</Text>
                </View>

                <View style={styles.mainWeatherSection}>
                  <WeatherDesc day={day} />
                  <View style={styles.tempContainer}>
                    <Text style={styles.temp}>
                      {typeof day.temp.day === 'number' ? Math.round(day.temp.day) : day.temp.day}
                    </Text>
                    <Text style={styles.tempSymbol}>°C</Text>
                  </View>
                </View>

                <View style={styles.forecastContainer}>
                  <View style={styles.forecastHeader}>
                    <Text style={styles.forecastTitle}>상세 정보</Text>
                    <Text style={styles.weekDayText}>{weekDayText}</Text>
                  </View>

                  <View style={styles.forecastGrid}>
                    <View style={styles.infoCard}>
                      <View style={styles.iconCircle}>
                        <FontAwesome6 name="wind" size={22} color="rgba(255,255,255,0.9)" />
                      </View>
                      <Text style={styles.infoLabel}>풍속</Text>
                      <Text style={styles.infoValue}>{day.wind_speed.toFixed(1)}</Text>
                      <Text style={styles.infoUnit}>m/s</Text>
                    </View>

                    <View style={styles.infoCard}>
                      <View style={styles.iconCircle}>
                        <FontAwesome6 name="droplet" size={22} color="rgba(255,255,255,0.9)" />
                      </View>
                      <Text style={styles.infoLabel}>습도</Text>
                      <Text style={styles.infoValue}>{day.humidity}</Text>
                      <Text style={styles.infoUnit}>%</Text>
                    </View>

                    <View style={styles.infoCard}>
                      <View style={styles.iconCircle}>
                        <FontAwesome6 name="gauge-high" size={22} color="rgba(255,255,255,0.9)" />
                      </View>
                      <Text style={styles.infoLabel}>기압</Text>
                      <Text style={styles.infoValue}>{day.pressure}</Text>
                      <Text style={styles.infoUnit}>hPa</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            );
          })
        )}
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  weather: {
    flex: 1,
  },

  weatherInner: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  day: {
    width: SCREEN_WIDTH,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  topSection: {
    marginTop: 20,
    marginBottom: 30,
  },

  city: {
    fontSize: 42,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  regDate: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.3,
  },

  mainWeatherSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  weatherDescContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  weatherIcon: {
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  weatherLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  temp: {
    fontSize: 110,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.98)',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },

  tempSymbol: {
    fontSize: 36,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 20,
    marginLeft: 5,
  },

  forecastContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  forecastTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.3,
  },

  weekDayText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },

  infoUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
});
export default App;
