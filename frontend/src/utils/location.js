export const reverseGeocode = async (latitude, longitude) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
    headers: { 'Accept-Language': 'en' },
  });
  const data = await res.json();
  const geo = data.address || {};
  const street = [geo.house_number, geo.road, geo.suburb, geo.neighbourhood].filter(Boolean).join(', ');

  return {
    pincode: geo.postcode || '',
    city: geo.city || geo.town || geo.village || geo.county || '',
    state: geo.state || '',
    street,
    displayName: data.display_name || [street, geo.city || geo.town || geo.village, geo.state, geo.postcode].filter(Boolean).join(', '),
  };
};

