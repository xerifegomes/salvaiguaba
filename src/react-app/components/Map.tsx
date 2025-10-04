import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IGUABA_GRANDE_CENTER, type BagWithEstablishment } from '@/shared/types';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  bags: BagWithEstablishment[];
  onBagClick: (bag: BagWithEstablishment) => void;
}

// Criar ícone customizado
const createCustomIcon = (category: string) => {
  const getIconEmoji = (category: string) => {
    switch (category) {
      case 'padaria': return '🥖';
      case 'restaurante': return '🍽️';
      case 'mercado': return '🛒';
      case 'lanchonete': return '🍔';
      case 'cafeteria': return '☕';
      case 'pizzaria': return '🍕';
      default: return '🍴';
    }
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: #67d695;
        border: 3px solid #00615f;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${getIconEmoji(category)}
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
    className: 'custom-marker'
  });
};

function MapUpdater({ bags }: { bags: BagWithEstablishment[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (bags.length > 0) {
      const group = new L.FeatureGroup();
      bags.forEach(bag => {
        if (bag.establishment) {
          const marker = L.marker([
            bag.establishment.latitude, 
            bag.establishment.longitude
          ]);
          group.addLayer(marker);
        }
      });
      
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [bags, map]);
  
  return null;
}

export default function Map({ bags, onBagClick }: MapProps) {
  const mapRef = useRef<L.Map>(null);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[IGUABA_GRANDE_CENTER.lat, IGUABA_GRANDE_CENTER.lng]}
        zoom={13}
        className="w-full h-full rounded-2xl"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater bags={bags} />
        
        {bags.map((bag) => (
          bag.establishment && (
            <Marker
              key={bag.id}
              position={[bag.establishment.latitude, bag.establishment.longitude]}
              icon={createCustomIcon(bag.establishment.category)}
              eventHandlers={{
                click: () => onBagClick(bag)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2">{bag.establishment.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{bag.establishment.address}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="font-semibold text-md mb-1">{bag.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{bag.description}</p>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-green-600">
                        R$ {bag.price.toFixed(2)}
                      </span>
                      {bag.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {bag.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Disponível: {bag.quantity_available}</span>
                      <span>{bag.pickup_start_time} - {bag.pickup_end_time}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBagClick(bag);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reservar Bag
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
