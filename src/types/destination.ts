export interface Hotel {
  name: string;
  area: string;
  priceRange: string;
  rating: number;
  tier: "budget" | "mid-range" | "luxury";
  agodaHotelId: string;
  description: string;
  image: string;
}

export interface Activity {
  name: string;
  duration: string;
  price: string;
  category: string;
  klookActivityId: string;
  description: string;
  image: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  type: string;
  klookId?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  items: ItineraryItem[];
}

export interface WeatherMonth {
  month: string;
  high: number;
  low: number;
  rain: number;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  description: string;
  heroImage: string;
  heroImageCredit?: { name: string; link: string };
  quickInfo: {
    bestSeason: string;
    avgBudget: string;
    timezone: string;
    language: string;
    currency: string;
    visa: string;
  };
  agodaCityId: string;
  klookDestinationId: string;
  hotels: Hotel[];
  activities: Activity[];
  itinerary: {
    "3days": ItineraryDay[];
  };
  practicalInfo: {
    gettingThere: string;
    localTransport: string;
    weather: WeatherMonth[];
  };
  themes: string[];
  relatedCities: string[];
}
