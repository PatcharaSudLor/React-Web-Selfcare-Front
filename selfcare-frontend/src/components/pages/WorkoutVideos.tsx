import { ArrowLeft, Play, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Local type for the selected body part
interface BodyPart {
  id: string;
  name: string;
}

// Simple inline ImageWithFallback to avoid extra file dependency
function ImageWithFallback({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+image';
      }}
    />
  );
}

interface WorkoutVideosProps {
  bodyPart: BodyPart;
  onBack: () => void;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  level: string;
  thumbnail: string;
  instructor: string;
}

// Mock data สำหรับวิดีโอ
const videosByBodyPart: Record<string, Video[]> = {
  'upper-body': [
    { id: '1', title: 'ท่าออกกำลังกายไหล่และหลังสำหรับมือใหม่', duration: '15 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1756212279739-151869a36cfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชแนน' },
    { id: '2', title: 'เสริมสร้างกล้ามเนื้อส่วนบนระดับกลาง', duration: '20 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชบีม' },
    { id: '3', title: 'ท่ายากสำหรับส่วนบนแข็งแรง', duration: '25 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปอนด์' },
    { id: '4', title: 'ไหล่แน่นใน 10 นาที', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1603575448360-1b9e5b7f8c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชมาย' },
    { id: '5', title: 'เวทเทรนนิ่งสำหรับหน้าอกและไหล่', duration: '30 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1517960463706-9d8c2a3b6c6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชกอล์ฟ' },
    { id: '6', title: 'HIIT ส่วนบน (ไม่มีอุปกรณ์)', duration: '18 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปาล์ม' },
    { id: '7', title: 'ปรับท่าโพสท์และท่าเสริมความแข็งแรง', duration: '22 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1526403224749-989f1a8c8b51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโอ๊ต' },
    { id: '8', title: 'คูลดาวน์และยืดกล้ามเนื้อส่วนบน', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเมย์' },
    { id: '9', title: 'กล้ามเนื้อหลังแข็งแรง (ระดับกลาง)', duration: '28 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเคน' },
    { id: '10', title: 'Power Upper: ความท้าทาย 30 นาที', duration: '30 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโจ' },
  ],
  core: [
    { id: '11', title: 'ท้องแบนสำหรับผู้เริ่มต้น', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1593308610775-48f0102f1722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชมายด์' },
    { id: '12', title: 'Six Pack ระดับกลาง', duration: '15 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชกอล์ฟ' },
    { id: '13', title: 'Core แกร่งระดับสูง', duration: '20 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเคน' },
    { id: '14', title: 'Pilates เบาๆ สำหรับแกนกลาง', duration: '25 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชแอ๊ป' },
    { id: '15', title: 'Plank Challenge 5 นาที', duration: '5 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1554306296-1f8f0f9e04b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชบีม' },
    { id: '16', title: 'Abs & Mobility', duration: '18 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1546484959-fb4f3f538b8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชมาย' },
    { id: '17', title: 'เวิร์กเอาท์แกนกลางแบบวงจร', duration: '22 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1526403224749-989f1a8c8b51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปอนด์' },
    { id: '18', title: 'Core สำหรับนักวิ่ง', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเคน' },
    { id: '19', title: 'Six Pack Advanced', duration: '30 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1526403224749-989f1a8c8b51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโจ' },
    { id: '20', title: 'Stability & Balance Core', duration: '16 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเมย์' },
  ],
  legs: [
    { id: '21', title: 'ขาสวยสำหรับมือใหม่', duration: '15 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1595554919383-e6af8ed85d0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปาล์ม' },
    { id: '22', title: 'ขาแข็งแรงระดับกลาง', duration: '20 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโอ๊ต' },
    { id: '23', title: 'ท่ายากสำหรับขาทรงพลัง', duration: '25 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโจ' },
    { id: '24', title: 'Glute Activation', duration: '14 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชแอ๊ป' },
    { id: '25', title: 'Strength Legs Circuit', duration: '30 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1517960463706-9d8c2a3b6c6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปาล์ม' },
    { id: '26', title: 'เลคเดย์: ขาโฟกัส', duration: '28 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชกอล์ฟ' },
    { id: '27', title: 'Lunges & Plyo', duration: '20 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโอ๊ต' },
    { id: '28', title: 'Lower Body Mobility', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเมย์' },
    { id: '29', title: 'Hamstring & Quad Focus', duration: '18 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1603575448360-1b9e5b7f8c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเคน' },
    { id: '30', title: 'Pro Leg Strength', duration: '35 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชโจ' },
  ],
  stretching: [
    { id: '31', title: 'ยืดเหยียดเบื้องต้นผ่อนคลาย', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชนิ้ว' },
    { id: '32', title: 'ยืดกล้ามเนื้อแบบครบวงจร', duration: '15 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเมย์' },
    { id: '33', title: 'ยืดเหยียดขั้นสูงเพิ่มความยืดหยุ่น', duration: '20 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเอิร์น' },
    { id: '34', title: 'Yoga Stretch Flow', duration: '22 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชมายด์' },
    { id: '35', title: 'Shoulder & Neck Release', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1514404641122-7b3c6b7f3b1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปอนด์' },
    { id: '36', title: 'Full Body Flexibility', duration: '30 นาที', level: 'ยาก', thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชบีม' },
    { id: '37', title: 'Post-Workout Stretch', duration: '15 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1526403224749-989f1a8c8b51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเมย์' },
    { id: '38', title: 'Deep Mobility Routine', duration: '25 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชเคน' },
    { id: '39', title: 'Flexibility for Runners', duration: '18 นาที', level: 'ปานกลาง', thumbnail: 'https://images.unsplash.com/photo-1546484959-fb4f3f538b8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชปาล์ม' },
    { id: '40', title: 'Gentle Stretch & Breathe', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', instructor: 'โค้ชนิ้ว' },
  ],
};

export default function WorkoutVideos({ bodyPart, onBack }: WorkoutVideosProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const availableParts: BodyPart[] = [
    { id: 'upper-body', name: 'Upper Body' },
    { id: 'core', name: 'Core & Abdominal' },
    { id: 'legs', name: 'Legs' },
    { id: 'stretching', name: 'Stretching' },
  ]

  const qs = new URLSearchParams(location.search)
  const initialPartId = qs.get('part') || bodyPart.id || 'upper-body'
  const [selectedPartId, setSelectedPartId] = useState<string>(initialPartId)

  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (q.get('part') !== selectedPartId) {
      q.set('part', selectedPartId)
      navigate({ pathname: location.pathname, search: `?${q.toString()}` }, { replace: true })
    }
  }, [selectedPartId])

  const videos = videosByBodyPart[selectedPartId] || [];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ง่าย':
        return 'bg-green-100 text-green-700';
      case 'ปานกลาง':
        return 'bg-yellow-100 text-yellow-700';
      case 'ยาก':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-hidden pt-16">
      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto pt-6">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-3xl text-center text-gray-800 mb-2">
              {availableParts.find(p => p.id === selectedPartId)?.name ?? bodyPart.name}
            </h2>
            <p className="text-center text-gray-600 mb-6">เลือกวิดีโอที่เหมาะกับระดับของคุณ</p>

            {/* Body part selector */}
            <div className="flex items-center gap-3 justify-center mb-6">
              {availableParts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPartId(p.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${selectedPartId === p.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group border border-gray-100"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105">
                        <Play className="w-5 h-5 text-emerald-600" fill="currentColor" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${getLevelColor(video.level)}`}>
                        {video.level}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-gray-800 group-hover:text-emerald-600 transition-colors text-sm font-medium">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">{video.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">{video.level}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">โดย {video.instructor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}