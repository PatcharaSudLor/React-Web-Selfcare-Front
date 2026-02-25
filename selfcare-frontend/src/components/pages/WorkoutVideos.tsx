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
  description: string;
  youtubeLink: string;
}

// Mock data สำหรับวิดีโอ
const videosByBodyPart: Record<string, Video[]> = {
  'upper-body': [
    { id: '1', title: 'MadFit - 15 MIN UPPER BODY WORKOUT (No Equipment)', duration: '15 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/gC_L9qAHVJ8/hqdefault.jpg', description: 'คลิปนี้เน้นไหล่ แขน และหลังส่วนบนแบบไม่ใช้อุปกรณ์ เหมาะสำหรับผู้เริ่มต้นถึงระดับกลาง', youtubeLink: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8' },
    { id: '2', title: 'MadFit - 20 MIN UPPER BODY DUMBBELL WORKOUT', duration: '20 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/U0bhE67HuDY/hqdefault.jpg', description: 'เวิร์กเอาต์กล้ามเนื้อช่วงบนด้วยดัมเบลที่ทำตามง่ายและค่อยๆ เพิ่มความท้าทายได้', youtubeLink: 'https://www.youtube.com/watch?v=U0bhE67HuDY' },
    { id: '3', title: 'FitnessBlender - Beginner Upper Body Workout', duration: '16 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/X3-gKPNyrTA/hqdefault.jpg', description: 'โปรแกรมฝึกช่วงบนแบบพื้นฐาน จังหวะชัดเจนและปลอดภัยสำหรับคนเริ่มต้น', youtubeLink: 'https://www.youtube.com/watch?v=X3-gKPNyrTA' },
    { id: '4', title: 'HASfit - Dumbbell Upper Body Workout', duration: '22 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/qEwKCR5JCog/hqdefault.jpg', description: 'ฝึกอก หลัง ไหล่ และแขนด้วยท่ามาตรฐานที่อธิบายชัดเจน เหมาะกับการสร้างพื้นฐาน', youtubeLink: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
    { id: '5', title: 'Pamela Reif - Upper Body Workout', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/eozdVDA78K0/hqdefault.jpg', description: 'คลิปโฟกัสช่วงบนที่เน้นความกระชับและความแข็งแรงในเวลาสั้นๆ', youtubeLink: 'https://www.youtube.com/watch?v=eozdVDA78K0' },
    { id: '6', title: 'MadFit - 10 MIN UPPER BODY WORKOUT (No Equipment)', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/0A3EgOztptQ/hqdefault.jpg', description: 'โฟกัสอก ไหล่ แขน และหลังส่วนบนแบบไม่ใช้อุปกรณ์ เหมาะวันฝึกสั้นแต่เข้มข้น', youtubeLink: 'https://www.youtube.com/watch?v=0A3EgOztptQ' },
    { id: '7', title: 'Chloe Ting - 10 MIN ARM WORKOUT', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/j64BBgBGNIU/hqdefault.jpg', description: 'เน้นกระชับต้นแขนและหัวไหล่ด้วยท่าพื้นฐาน ทำตามง่ายสำหรับผู้เริ่มต้น', youtubeLink: 'https://www.youtube.com/watch?v=j64BBgBGNIU' },
    { id: '8', title: 'MadFit - 15 MIN UPPER BODY (NO REPEATS)', duration: '15 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/Eml2xnoLpYE/hqdefault.jpg', description: 'โปรแกรมช่วงบนแบบไม่ซ้ำท่า ช่วยกระตุ้นกล้ามเนื้อแขน ไหล่ และหลังหลายมุม', youtubeLink: 'https://www.youtube.com/watch?v=Eml2xnoLpYE' },
  ],
  core: [
    { id: '11', title: 'Chloe Ting - Get Abs in 2 Weeks (Abs Workout)', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/2pLT-olgUJs/hqdefault.jpg', description: 'คลิปหน้าท้องยอดนิยมที่เน้นแกนกลางลำตัวและทำตามได้ที่บ้านโดยไม่ใช้อุปกรณ์', youtubeLink: 'https://www.youtube.com/watch?v=2pLT-olgUJs' },
    { id: '12', title: 'Pamela Reif - 10 MIN AB WORKOUT', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/AnYl6Nk9GOA/hqdefault.jpg', description: 'เวิร์กเอาต์หน้าท้อง 10 นาทีแบบต่อเนื่อง เหมาะกับผู้เริ่มต้นที่อยากเพิ่มความฟิตแกนกลาง', youtubeLink: 'https://www.youtube.com/watch?v=AnYl6Nk9GOA' },
    { id: '13', title: 'Pamela Reif - 10 MIN SIXPACK WORKOUT', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/lCg_gh_fppI/hqdefault.jpg', description: 'คลิปแกนกลางระดับต้นถึงกลางที่ช่วยพัฒนาความทนทานของกล้ามท้องอย่างมีระบบ', youtubeLink: 'https://www.youtube.com/watch?v=lCg_gh_fppI' },
    { id: '14', title: 'Emi Wong - 10 MIN ABS WORKOUT', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/Q-vuR4PJh2c/hqdefault.jpg', description: 'ท่าหน้าท้องที่ไม่ซับซ้อนและกระชับเวลา เหมาะสำหรับฝึกประจำวัน', youtubeLink: 'https://www.youtube.com/watch?v=Q-vuR4PJh2c' },
    { id: '15', title: 'Blogilates - Beginner Abs Workout', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/DHD1-2P94DI/hqdefault.jpg', description: 'คลิปบริหารหน้าท้องสำหรับมือใหม่ เน้นคุมฟอร์มและหายใจให้ถูกจังหวะ', youtubeLink: 'https://www.youtube.com/watch?v=DHD1-2P94DI' },
    { id: '16', title: 'Emi Wong - 10 MIN LOWER ABS WORKOUT', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/gOkCJ57IvNg/hqdefault.jpg', description: 'เจาะหน้าท้องล่างด้วยท่ายกขาและคุมเชิงกราน เหมาะสำหรับเสริมความมั่นคงของแกนกลาง', youtubeLink: 'https://www.youtube.com/watch?v=gOkCJ57IvNg' },
    { id: '17', title: 'POPSUGAR - 10 Minute Ab Workout', duration: '10 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/IODxDxX7oi4/hqdefault.jpg', description: 'คลิปหน้าท้องแบบโค้ชนำจังหวะชัด เหมาะกับคนที่ต้องการ core session สั้นแต่ครบ', youtubeLink: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
    { id: '18', title: 'MadFit - 12 MIN STANDING ABS WORKOUT', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/Hk5xQwM8Hf8/hqdefault.jpg', description: 'ฝึกแกนกลางแบบยืน ลดแรงกดหลังล่าง และเหมาะกับวันที่ไม่อยากนอนเล่นท่าบนพื้น', youtubeLink: 'https://www.youtube.com/watch?v=Hk5xQwM8Hf8' },
  ],
  legs: [
    { id: '21', title: 'Chloe Ting - Slim Thigh Workout', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/oAPCPjnU1wA/hqdefault.jpg', description: 'เวิร์กเอาต์ขาและต้นขาที่ทำได้ในพื้นที่จำกัด เหมาะกับผู้เริ่มต้นถึงกลาง', youtubeLink: 'https://www.youtube.com/watch?v=oAPCPjnU1wA' },
    { id: '22', title: 'MadFit - 15 MIN LEG WORKOUT (No Equipment)', duration: '15 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/xo1VInw-SKc/hqdefault.jpg', description: 'คลิปโฟกัสกล้ามขาโดยไม่ใช้อุปกรณ์ เหมาะสำหรับฝึกความแข็งแรงพื้นฐาน', youtubeLink: 'https://www.youtube.com/watch?v=xo1VInw-SKc' },
    { id: '23', title: 'Pamela Reif - 12 MIN LEG WORKOUT', duration: '12 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/8qDDtm6BOfw/hqdefault.jpg', description: 'โปรแกรมกระชับขาแบบเข้มข้นระยะสั้น ช่วยเพิ่มความทนทานของช่วงล่าง', youtubeLink: 'https://www.youtube.com/watch?v=8qDDtm6BOfw' },
    { id: '24', title: 'FitnessBlender - Lower Body Workout for Beginners', duration: '20 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/1f8yoFFdkcY/hqdefault.jpg', description: 'คลิปฝึกขาและสะโพกที่คุมจังหวะได้ง่าย ลดแรงกระแทกและเหมาะกับมือใหม่', youtubeLink: 'https://www.youtube.com/watch?v=1f8yoFFdkcY' },
    { id: '25', title: 'HASfit - Leg Workout at Home', duration: '25 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/9XfYqT0M-fg/hqdefault.jpg', description: 'เวิร์กเอาต์ขาที่ครอบคลุมต้นขา หน้า-หลังขา และก้น พร้อมคำแนะนำท่าชัดเจน', youtubeLink: 'https://www.youtube.com/watch?v=9XfYqT0M-fg' },
    { id: '26', title: 'Pamela Reif - 15 MIN LEG WORKOUT', duration: '15 นาที', level: 'ยาก', thumbnail: 'https://i.ytimg.com/vi/H8kBcmS3vQY/hqdefault.jpg', description: 'เน้น squat และ lunge ต่อเนื่องเพื่อกระตุ้นต้นขาและสะโพก เหมาะกับคนที่ต้องการความเข้มขึ้น', youtubeLink: 'https://www.youtube.com/watch?v=H8kBcmS3vQY' },
    { id: '27', title: 'Emi Wong - 10 MIN LEGS WORKOUT', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/YdB1HMCldJY/hqdefault.jpg', description: 'โปรแกรมขาสำหรับทำที่บ้านแบบไม่ซับซ้อน ช่วยสร้างพื้นฐานแรงขาได้ดี', youtubeLink: 'https://www.youtube.com/watch?v=YdB1HMCldJY' },
    { id: '28', title: 'Chloe Ting - Lower Body Workout', duration: '12 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/ZiDgJEt3x1U/hqdefault.jpg', description: 'เจาะกล้ามเนื้อช่วงล่างโดยเน้นต้นขาและก้น ช่วยเพิ่มความทนทานและความกระชับ', youtubeLink: 'https://www.youtube.com/watch?v=ZiDgJEt3x1U' },
  ],
  stretching: [
    { id: '31', title: 'Yoga With Adriene - Yoga For Complete Beginners', duration: '20 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/v7AYKMP6rOE/hqdefault.jpg', description: 'โยคะยืดเหยียดพื้นฐานทั้งตัวที่นุ่มนวล เหมาะมากสำหรับเริ่มต้นและวันพักฟื้น', youtubeLink: 'https://www.youtube.com/watch?v=v7AYKMP6rOE' },
    { id: '32', title: 'Yoga With Adriene - Morning Yoga Flow', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/4pKly2JojMw/hqdefault.jpg', description: 'คลิปยืดเหยียดตอนเช้าเพื่อปลุกร่างกายและเพิ่มความคล่องตัวก่อนเริ่มวัน', youtubeLink: 'https://www.youtube.com/watch?v=4pKly2JojMw' },
    { id: '33', title: 'Yoga With Adriene - Yoga for Back Pain', duration: '17 นาที', level: 'ปานกลาง', thumbnail: 'https://i.ytimg.com/vi/Ho9em79_0qg/hqdefault.jpg', description: 'ท่ายืดเน้นหลังและสะโพก ช่วยคลายความตึงจากการนั่งนานและฟื้นฟูการเคลื่อนไหว', youtubeLink: 'https://www.youtube.com/watch?v=Ho9em79_0qg' },
    { id: '34', title: 'Yoga With Adriene - Yoga for Neck and Shoulders', duration: '18 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/sTANio_2E0Q/hqdefault.jpg', description: 'คลิปยืดคอและไหล่แบบอ่อนโยน ลดอาการตึงจากการทำงานหน้าจอได้ดี', youtubeLink: 'https://www.youtube.com/watch?v=sTANio_2E0Q' },
    { id: '35', title: 'MadFit - 10 MIN FULL BODY STRETCH', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/lD9ZDwlHmNA/hqdefault.jpg', description: 'คูลดาวน์ยืดทั้งตัวหลังออกกำลังกาย ช่วยลดอาการตึงและเพิ่มช่วงการเคลื่อนไหว', youtubeLink: 'https://www.youtube.com/watch?v=lD9ZDwlHmNA' },
    { id: '36', title: 'Pamela Reif - 10 MIN POST-WORKOUT STRETCH', duration: '10 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/qULTwquOuT4/hqdefault.jpg', description: 'ชุดยืดเหยียดหลังออกกำลังกายที่ช่วยคลายตึงกล้ามเนื้อขา สะโพก และหลังส่วนล่าง', youtubeLink: 'https://www.youtube.com/watch?v=qULTwquOuT4' },
    { id: '37', title: 'Emi Wong - 12 MIN FULL BODY STRETCH ROUTINE', duration: '12 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/g_tea8ZNk5A/hqdefault.jpg', description: 'ยืดทั้งตัวแบบไม่ใช้อุปกรณ์ โฟกัสคอ ไหล่ หลัง และสะโพกสำหรับฟื้นตัวประจำวัน', youtubeLink: 'https://www.youtube.com/watch?v=g_tea8ZNk5A' },
    { id: '38', title: 'Growingannanas - 15 MIN COOL DOWN STRETCH', duration: '15 นาที', level: 'ง่าย', thumbnail: 'https://i.ytimg.com/vi/ml6cT4AZdqI/hqdefault.jpg', description: 'คูลดาวน์เน้นการยืดหลังขา สะโพก และแนวหลัง เพื่อช่วยให้ร่างกายฟื้นตัวหลังวันฝึกหนัก', youtubeLink: 'https://www.youtube.com/watch?v=ml6cT4AZdqI' },
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
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group border border-gray-100"
                >
                  <a
                    href={video.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video overflow-hidden block"
                    aria-label={`เปิดวิดีโอ ${video.title} บน YouTube`}
                  >
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
                  </a>

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
                      <p className="text-sm text-gray-600">{video.description}</p>
                      <a
                        href={video.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        ไปยังวิดีโอ YouTube
                      </a>
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