import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface Props {
  // 0..7 continuous chapter position, written by the page's scroll handler.
  chapterRef: MutableRefObject<number>;
  staticPose?: boolean; // reduced motion: hold the full exploded pose
}

const smooth = (c: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((c - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// 1 near `center`, 0 elsewhere; used to pull one organ forward per chapter.
const bell = (c: number, center: number) => smooth(c, center - 0.55, center - 0.12) * (1 - smooth(c, center + 0.12, center + 0.55));

const CAMERA_KEYS: Array<[number, number, number]> = [
  [4.8, 3.0, 5.9],   // 0 front three-quarter
  [-5.2, 2.5, 5.0],  // 1 orbit left
  [2.5, 1.9, 5.2],   // 2 compressor
  [-5.8, 2.8, 4.6],  // 3 coil bank, wider
  [0.8, 2.5, 4.6],   // 4 valve close
  [3.2, 5.2, 3.8],   // 5 fan, high angle
  [7.2, 4.4, 7.2],   // 6 wide constellation
  [7.8, 5.0, 7.8],   // 7 hold
];

const TARGET_KEYS: Array<[number, number, number]> = [
  [0, 1.2, 0],
  [0, 1.2, 0],
  [0.9, 1.0, 1.4],
  [-1.4, 1.2, 0],
  [0, 1.5, 1.6],
  [0, 2.3, 0],
  [0, 1.5, 0],
  [0, 1.7, 0],
];

function sampleKeys(keys: Array<[number, number, number]>, c: number, out: THREE.Vector3) {
  const i = Math.min(Math.floor(c), keys.length - 2);
  const t = smooth(c - i, 0, 1);
  out.set(
    THREE.MathUtils.lerp(keys[i][0], keys[i + 1][0], t),
    THREE.MathUtils.lerp(keys[i][1], keys[i + 1][1], t),
    THREE.MathUtils.lerp(keys[i][2], keys[i + 1][2], t)
  );
}

// Serpentine copper tube across a vertical slab face.
function serpentinePoints(length: number, height: number, rows: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let r = 0; r < rows; r++) {
    const y = -height / 2 + (height * (r + 0.5)) / rows;
    const dir = r % 2 === 0 ? 1 : -1;
    pts.push(new THREE.Vector3(-dir * (length / 2 - 0.1), y, 0));
    pts.push(new THREE.Vector3(dir * (length / 2 - 0.1), y, 0));
  }
  return pts;
}

interface PartPose {
  home: [number, number, number];
  exploded: [number, number, number];
  focus?: [number, number, number];
  focusChapter?: number;
}

const POSES: Record<string, PartPose> = {
  basePan:    { home: [0, 0.07, 0],        exploded: [0, -1.3, 0] },
  panels:     { home: [0, 0, 0],           exploded: [0, 0, 0] }, // panels ghost, not fly
  grille:     { home: [0, 2.56, 0],        exploded: [0, 4.3, 0] },
  fan:        { home: [0, 2.14, 0],        exploded: [0, 3.5, 0],  focus: [0, 0.7, 0.6],  focusChapter: 5 },
  motor:      { home: [0, 1.78, 0],        exploded: [0, 2.8, 0] },
  compressor: { home: [0.7, 0.75, 0.5],    exploded: [2.2, 0.85, 1.7], focus: [0.2, 0.3, 1.1], focusChapter: 2 },
  accumulator:{ home: [1.18, 0.55, -0.15], exploded: [2.9, 0.6, -0.7] },
  coilL:      { home: [-1.32, 1.25, 0],    exploded: [-3.3, 1.25, 0],  focus: [-0.6, 0, 0.4], focusChapter: 3 },
  coilB:      { home: [0, 1.25, -1.32],    exploded: [0, 1.25, -3.3],  focus: [0, 0, -0.5],   focusChapter: 3 },
  coilR:      { home: [1.32, 1.25, 0],     exploded: [3.3, 1.25, 0],   focus: [0.6, 0, 0.4],  focusChapter: 3 },
  valve:      { home: [-0.55, 1.05, 0.55], exploded: [-2.5, 2.0, 1.0], focus: [0.55, 0.45, 1.05], focusChapter: 4 },
  board:      { home: [-1.16, 1.6, 0.85],  exploded: [-3.1, 2.6, 0.3] },
  lineset:    { home: [0, 0, 0],           exploded: [0.9, -0.3, 0.4] },
};

const LABEL_ANCHORS: Record<string, [number, number, number]> = {
  compressor: [0.75, 0.75, 0],
  coil: [0, 1.1, 0],
  valve: [0.5, 0.35, 0],
  fan: [0.9, 0.15, 0],
  board: [0.35, 0.55, 0],
  cabinet: [0, -1.65, 1.0],
};

export default function HeatPumpScene({ chapterRef, staticPose = false }: Props) {
  const groups = useRef<Record<string, THREE.Group | null>>({});
  const machine = useRef<THREE.Group>(null);
  const fanSpin = useRef<THREE.Group>(null);
  const c = useRef(staticPose ? 6 : 0);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const smoothedTarget = useMemo(() => new THREE.Vector3(0, 1.2, 0), []);

  // Shared materials: all panels ghost together; all copper glows together.
  const panelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2E2823',
        roughness: 0.6,
        metalness: 0.55,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      }),
    []
  );
  const copperGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#B87333',
        emissive: new THREE.Color('#B87333'),
        emissiveIntensity: 0,
        roughness: 0.32,
        metalness: 0.92,
      }),
    []
  );

  const coilCurveMain = useMemo(
    () => new THREE.CatmullRomCurve3(serpentinePoints(2.4, 1.9, 6), false, 'catmullrom', 0.08),
    []
  );
  const linesetCurveA = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.35, 1.0, 0.62),
        new THREE.Vector3(0.6, 0.6, 1.05),
        new THREE.Vector3(1.7, 0.42, 1.15),
        new THREE.Vector3(2.5, 0.4, 1.18),
      ]),
    []
  );
  const linesetCurveB = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.3, 0.9, 0.55),
        new THREE.Vector3(0.65, 0.5, 0.95),
        new THREE.Vector3(1.75, 0.32, 1.05),
        new THREE.Vector3(2.5, 0.3, 1.08),
      ]),
    []
  );

  useFrame((state, delta) => {
    // Scrub with drafting-table smoothing; static pose holds the constellation.
    const target = staticPose ? 6 : chapterRef.current;
    c.current += (target - c.current) * Math.min(1, delta * 5);
    const cc = c.current;

    const explodeT = smooth(cc, 5.3, 6.05);
    const ghostT = smooth(cc, 0.55, 1.2);

    for (const [key, pose] of Object.entries(POSES)) {
      const g = groups.current[key];
      if (!g) continue;
      const f = pose.focus && pose.focusChapter !== undefined ? bell(cc, pose.focusChapter) : 0;
      g.position.set(
        pose.home[0] + (pose.exploded[0] - pose.home[0]) * explodeT + (pose.focus?.[0] ?? 0) * f,
        pose.home[1] + (pose.exploded[1] - pose.home[1]) * explodeT + (pose.focus?.[1] ?? 0) * f,
        pose.home[2] + (pose.exploded[2] - pose.home[2]) * explodeT + (pose.focus?.[2] ?? 0) * f
      );
    }

    panelMat.opacity = THREE.MathUtils.lerp(0.95, 0.09, ghostT);
    copperGlowMat.emissiveIntensity = 0.5 * bell(cc, 1) + 0.12 * explodeT;
    if (fanSpin.current) {
      fanSpin.current.rotation.y += delta * (0.35 + 2.6 * bell(cc, 5));
    }
    if (machine.current) {
      machine.current.rotation.y = 0.16 * Math.sin(state.clock.elapsedTime * 0.22) * (1 - smooth(cc, 0.4, 0.9));
    }

    sampleKeys(CAMERA_KEYS, cc, camPos);
    sampleKeys(TARGET_KEYS, cc, camTarget);
    // Narrow viewports get a longer lens: pull the camera back so the machine breathes.
    const aspect = state.size.width / state.size.height;
    if (aspect < 1.25) camPos.multiplyScalar(Math.min(1.6, 1 + (1.25 - aspect) * 0.75));
    state.camera.position.lerp(camPos, Math.min(1, delta * 5));
    smoothedTarget.lerp(camTarget, Math.min(1, delta * 5));
    state.camera.lookAt(smoothedTarget);
  });

  const setGroup = (key: string) => (node: THREE.Group | null) => {
    groups.current[key] = node;
  };

  const showAllLabels = staticPose;

  return (
    <>
      <color attach="background" args={['#0D0B09']} />
      <fog attach="fog" args={['#0D0B09', 13, 24]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} color="#FFF4E4" />
      <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#D08A45" />
      <pointLight position={[0, 3.4, 2.5]} intensity={0.65} color="#F2E3D2" distance={10} />

      <group ref={machine} position={[0, -0.8, 0]}>
        {/* Base pan */}
        <group ref={setGroup('basePan')}>
          <mesh>
            <boxGeometry args={[3.25, 0.14, 3.25]} />
            <meshStandardMaterial color="#221D18" roughness={0.75} metalness={0.4} />
          </mesh>
          <Label anchor={LABEL_ANCHORS.cabinet} show={showAllLabels} name="cabinet + lineset" price="$400–900" />
        </group>

        {/* Cabinet panels — go ghost at chapter 1 (the x-ray move) */}
        <group ref={setGroup('panels')}>
          {([
            [0, 1.32, 1.6, 0],
            [0, 1.32, -1.6, 0],
            [1.6, 1.32, 0, Math.PI / 2],
            [-1.6, 1.32, 0, Math.PI / 2],
          ] as const).map(([x, y, z, rot], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0]} material={panelMat}>
              <boxGeometry args={[3.2, 2.35, 0.05]} />
            </mesh>
          ))}
        </group>

        {/* Fan grille */}
        <group ref={setGroup('grille')}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.12, 0.035, 10, 48]} />
            <meshStandardMaterial color="#3A342C" roughness={0.55} metalness={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.62, 0.028, 10, 40]} />
            <meshStandardMaterial color="#3A342C" roughness={0.55} metalness={0.6} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[2.24, 0.025, 0.05]} />
              <meshStandardMaterial color="#3A342C" roughness={0.55} metalness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Fan blades + motor */}
        <group ref={setGroup('fan')}>
          <group ref={fanSpin}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.16, 0.22, 20]} />
              <meshStandardMaterial color="#4A4238" roughness={0.5} metalness={0.6} />
            </mesh>
            {Array.from({ length: 3 }, (_, i) => (
              <mesh
                key={i}
                rotation={[0.42, (i * 2 * Math.PI) / 3, 0]}
                position={[
                  Math.sin((i * 2 * Math.PI) / 3) * 0.55,
                  0,
                  Math.cos((i * 2 * Math.PI) / 3) * 0.55,
                ]}
              >
                <boxGeometry args={[0.42, 0.02, 0.85]} />
                <meshStandardMaterial color="#514840" roughness={0.45} metalness={0.65} />
              </mesh>
            ))}
          </group>
          <Label anchor={LABEL_ANCHORS.fan} show={showAllLabels} chapter={5} chapterRef={chapterRef} name="fan + motor" price="$250–700" />
        </group>
        <group ref={setGroup('motor')}>
          <mesh>
            <cylinderGeometry args={[0.17, 0.17, 0.45, 20]} />
            <meshStandardMaterial color="#302A24" roughness={0.6} metalness={0.55} />
          </mesh>
        </group>

        {/* Compressor — the heart */}
        <group ref={setGroup('compressor')}>
          <mesh>
            <cylinderGeometry args={[0.48, 0.5, 1.05, 28]} />
            <meshStandardMaterial color="#14110E" roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.53, 0]}>
            <sphereGeometry args={[0.48, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#14110E" roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.62, 0.28]} rotation={[0.4, 0, 0.4]} material={copperGlowMat}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
          </mesh>
          <Label anchor={LABEL_ANCHORS.compressor} show={showAllLabels} chapter={2} chapterRef={chapterRef} name="compressor" price="$1,200–2,800" />
        </group>

        {/* Accumulator */}
        <group ref={setGroup('accumulator')}>
          <mesh>
            <cylinderGeometry args={[0.21, 0.21, 0.8, 20]} />
            <meshStandardMaterial color="#4E463C" roughness={0.45} metalness={0.75} />
          </mesh>
        </group>

        {/* Coil bank: three slabs with copper serpentine */}
        {(['coilL', 'coilB', 'coilR'] as const).map((key) => (
          <group key={key} ref={setGroup(key)} rotation={[0, key === 'coilB' ? 0 : Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[2.5, 2.0, 0.09]} />
              <meshStandardMaterial color="#3B352D" roughness={0.8} metalness={0.35} />
            </mesh>
            {/* Serpentine sits on the OUTWARD face so the orbiting camera always sees copper. */}
            <mesh position={[0, 0, key === 'coilR' ? 0.07 : -0.07]} material={copperGlowMat}>
              <tubeGeometry args={[coilCurveMain, 96, 0.032, 8, false]} />
            </mesh>
            {key === 'coilL' && (
              <Label anchor={LABEL_ANCHORS.coil} show={showAllLabels} chapter={3} chapterRef={chapterRef} name="coil + fins" price="$600–1,400" />
            )}
          </group>
        ))}

        {/* Reversing valve — the trick */}
        <group ref={setGroup('valve')}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.75, 18]} />
            <meshStandardMaterial color="#8C6A2F" roughness={0.3} metalness={0.95} />
          </mesh>
          {[-0.2, 0, 0.2].map((x) => (
            <mesh key={x} position={[x, -0.16, 0]} material={copperGlowMat}>
              <cylinderGeometry args={[0.045, 0.045, 0.24, 10]} />
            </mesh>
          ))}
          <mesh position={[0, 0.16, 0]} material={copperGlowMat}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 10]} />
          </mesh>
          <Label anchor={LABEL_ANCHORS.valve} show={showAllLabels} chapter={4} chapterRef={chapterRef} name="reversing valve" price="$120–350" />
        </group>

        {/* Control board */}
        <group ref={setGroup('board')}>
          <mesh>
            <boxGeometry args={[0.5, 0.68, 0.05]} />
            <meshStandardMaterial color="#20301F" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0.12, 0.1, 0.09]}>
            <cylinderGeometry args={[0.07, 0.07, 0.2, 12]} />
            <meshStandardMaterial color="#8A857C" roughness={0.35} metalness={0.85} />
          </mesh>
          <Label anchor={LABEL_ANCHORS.board} show={showAllLabels} name="control board" price="$150–500" />
        </group>

        {/* Lineset out to the house */}
        <group ref={setGroup('lineset')}>
          <mesh material={copperGlowMat}>
            <tubeGeometry args={[linesetCurveA, 48, 0.045, 8, false]} />
          </mesh>
          <mesh material={copperGlowMat}>
            <tubeGeometry args={[linesetCurveB, 48, 0.028, 8, false]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

interface LabelProps {
  anchor: [number, number, number];
  name: string;
  price: string;
  show?: boolean; // force-show (static pose)
  chapter?: number; // reserved: the chapter that focuses this part
  chapterRef?: MutableRefObject<number>;
}

// DOM chip pinned to a part. Chips appear only in the exploded finale — during
// focus chapters the chapter card carries the price, so no text ever sits on
// the moving figure (NN/g scrolljacking guidance).
function Label({ anchor, name, price, show = false, chapterRef }: LabelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!ref.current || show || chapterRef === undefined) return;
    ref.current.style.opacity = chapterRef.current > 5.55 ? '1' : '0';
  });

  return (
    <Html position={anchor} center distanceFactor={10} zIndexRange={[20, 0]}>
      <div
        ref={ref}
        className="pointer-events-none whitespace-nowrap border border-copper/50 bg-chamber/85 px-2 py-1 font-mono text-[10px] leading-tight text-paper transition-opacity duration-500"
        style={{ opacity: show ? 1 : 0 }}
      >
        <span className="text-copper-bright">{name}</span>
        <span className="ml-2 text-paper/70">{price}</span>
      </div>
    </Html>
  );
}
