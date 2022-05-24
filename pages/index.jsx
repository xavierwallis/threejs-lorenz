import styles from '../styles/Home.module.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react';
import { OrbitControls, Sky } from '@react-three/drei'

const points = [];
const lineDt = 0.01;
const dotSize = 0.08;

function Point({ ...props }) {
  const ref = useRef();
  const [xpos, setXPos] = useState(Math.random() * 20);
  const [ypos, setYPos] = useState(Math.random() * 20);
  const [zpos, setZPos] = useState(Math.random() * 20);
  const [updateTime, setUpdateTime] = useState(0);
  const scale = 0.1;
  const rotScale = 0.002;
  const dt = 0.005;
  const s = 10;
  const b = 8.0/3.0;
  const r = 28;
  const numLines = 400;
  
  useFrame(({ clock })=>{
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
        <tetrahedronGeometry scale={[0.5,0.5,0.5]} args={[0.5]}/>
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
  return (
    <div className={styles.container}>
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
