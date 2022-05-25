import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react';
import { OrbitControls, Sky } from '@react-three/drei'

const points = [];
let lineDt = 0.01;
let dotSize = 0.15;
let numLines = 1;
let penSize = 0.5;
let playing = true;

function Point({ ...props }) {
  const ref = useRef();
  const [xpos, setXPos] = useState(Math.random() * 20);
  const [ypos, setYPos] = useState(Math.random() * 20);
  const [zpos, setZPos] = useState(Math.random() * 20);
  const [updateTime, setUpdateTime] = useState(0);
  const scale = 0.2;
  const rotScale = 0.002;
  const dt = 0.005;
  const s = 10;
  const b = 8.0/3.0;
  const r = 28;
  
  useFrame(({ clock })=>{
    if (!playing) {
      return
    }
    const dx = (s * (ypos - xpos)) * dt;
    const dy = (-xpos * zpos + r * xpos - ypos) * dt;
    const dz = (xpos * ypos - b * zpos) * dt;
    setXPos(xpos + dx);
    setYPos(ypos + dy);
    setZPos(zpos + dz);
    
    const box = ref.current;
    box.position.set(scale * xpos - 0,scale * ypos - 0, scale * zpos - 3)
    box.rotation.x = box.rotation.x + (dy * rotScale * (180/Math.PI));
    box.rotation.y = box.rotation.y + (dz * rotScale * (180/Math.PI));
    box.rotation.z = box.rotation.z + (dx * rotScale * (180/Math.PI));
    
    if (clock.elapsedTime - updateTime > lineDt){
      setUpdateTime(clock.elapsedTime)
      if (points.length + 1 > numLines) {
        points.shift()
      }
      points.push([box.position.x,box.position.y,box.position.z])
    }
    

  });

  return (
    <>
      <mesh {...props} ref={ref}>
        <tetrahedronGeometry scale={[0.5,0.5,0.5]} args={[penSize]}/>
        <meshStandardMaterial color={'#4bb7db'}/>
      </mesh>
      {
        points.map((v,i)=>{
          return (
            <mesh key={i} position={v}>
              <sphereGeometry args={[dotSize]}/>
              <meshPhysicalMaterial color={'#8700e0'}/>
            </mesh>);
        })
      }
    </>
  );
}

function Rig(){
  const { camera } = useThree();
  const dt = 0.01
  useEffect(()=>{
    camera.position.x += Math.cos(90 * (180/Math.PI)) * 0.04;
    camera.position.z += Math.sin(90 * (180/Math.PI)) * 0.04;
  },[])
  let t = 0
  useFrame(({clock})=>{
    camera.position.z += Math.sin(clock.elapsedTime * dt * (180/Math.PI)) * 0.04
    camera.position.x += Math.cos(clock.elapsedTime * dt * (180/Math.PI)) * 0.04
    if (Math.sin(clock.elapsedTime * dt * (180/Math.PI)) * 0.04 > 0){
      t += Math.sin(clock.elapsedTime * dt * (180/Math.PI)) * 0.04
    }else{
      console.log(t)
    }
    camera.lookAt(0,0,0)
  })
  
  return null
}

function Floor({args,...props}) {
  return (
    <mesh {...props}>
      <boxBufferGeometry args={args}/>
      <meshPhysicalMaterial color={'gray'}/>
    </mesh>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0.15);
  const [pen, setPen] = useState(0.5)
  const [lineDeltat, setLineDeltat] = useState(0.02);
  const [numPoints, setNumPoints] = useState(1);
  const handlePointCount = (e) =>{
    playing = false
    setNumPoints(Math.round(e.target.value)); 
    numLines = Math.round(e.target.value)
    if (Math.round(e.target.value) < numLines){
      points.splice(-(numLines - Math.round(e.target.value)))
    }
    playing = true
  }
  return (
    <div className={'absolute w-screen h-full'}>
      <div className={'flex px-10 py-2 justify-around'}>
        <div className='flex'>
          <label className={'pr-12'}>Dot Size</label>
          <input className={''} type={'range'} min={0.01} max={1} step={'any'} defaultValue={0.15}  onChange={(e)=>{ setSlide(Math.round(e.target.value * 100)/100); dotSize = e.target.value}}/>
          <label className={'pl-2'}>{ slide }</label>
        </div>
        <div className='flex'>
          <label className={'pr-12'}>Pen Size</label>
          <input className={''} type={'range'} min={0.1} max={1} step={'any'} defaultValue={0.5} onChange={(e)=>{ setPen(Math.round(e.target.value * 100)/100); penSize = e.target.value}}/>
          <label className={'pl-2'}>{ pen }</label>
        </div>
        <div className='flex'>
          <label className={'pr-12'}>Point Delta Time</label>
          <input className={''} type={'range'} min={0.001} max={0.5} step={'any'} defaultValue={0.02} onChange={(e)=>{ setLineDeltat(Math.round(e.target.value * 1000)/1000); lineDt = e.target.value}}/>
          <label className={'pl-2'}>{ lineDeltat }</label>
        </div>
        <div className='flex'>
          <label className={'pr-12'}>Number of Points</label>
          <input className={''} type={'range'} min={1} max={500} step={'any'} defaultValue={1} onChange={handlePointCount}/>
          <label className={'pl-2'}>{ numPoints }</label>
        </div>
      </div>
      <Canvas camera={{position:[0,2,-10]}}>
        <ambientLight />
        <directionalLight position={[1,1,0]} rotation={[0,Math.PI/2,0]}/>
        <Point/>    
        <OrbitControls />
        <Sky />
      </Canvas>
    </div>
  )
}
