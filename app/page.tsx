
'use client';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, REACTIVE_REWARD_ENGINE_ABI, EVENT_HANDLER_ABI } from '@/lib/constants';
import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  AnimatePresence,
  MotionValue,
} from 'framer-motion';

import { ActionButton } from '@/components/Arena/ActionButton';
import { UserProfile } from '@/components/Arena/UserProfile';
import { RuleForm } from '@/components/RuleBuilder/RuleForm';
import { EventPipelineVisualizer } from '@/components/LiveDashboard/EventPipelineVisualizer';
import { LeaderboardLive } from '@/components/LiveDashboard/LeaderboardLive';
import { useAppStore } from '@/lib/store';
import { PipelineStep, RuleFormData } from '@/lib/types';
import {
  Zap, Sword, Dumbbell, Brain, ArrowRight,
  Activity, Shield, Cpu, Globe, ChevronDown, Terminal,
} from 'lucide-react';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { useAccount } from 'wagmi';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

 
/* ═══════════════════════════════════════
   AMBIENT EFFECTS
═══════════════════════════════════════ */

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px',
      }}
    />
  );
}

function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 55, damping: 16 });
  const sy = useSpring(y, { stiffness: 55, damping: 16 });
  useEffect(() => {
    const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <motion.div
      className="pointer-events-none fixed z-50 w-[700px] h-[700px] rounded-full"
      style={{
        left: sx, top: sy, x: '-50%', y: '-50%',
        background: 'radial-gradient(circle, rgba(99,60,220,0.06) 0%, transparent 65%)',
      }}
    />
  );
}

function MeshBackground({ scrollY }: { scrollY: MotionValue<number> }) {
  const orb1y = useTransform(scrollY, [0, 4000], [0, -500]);
  const orb2y = useTransform(scrollY, [0, 4000], [0, 300]);
  return (
    <div className="fixed inset-0 z-0 bg-[#050310] overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage:
          'linear-gradient(rgba(99,60,220,0.03) 1px,transparent 1px),' +
          'linear-gradient(90deg,rgba(99,60,220,0.03) 1px,transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <motion.div style={{ y: orb1y }}
        className="absolute -top-[30%] -left-[15%] w-[900px] h-[900px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full rounded-full" style={{
          background: 'radial-gradient(circle at center,rgba(99,60,220,0.18) 0%,rgba(99,60,220,0.04) 40%,transparent 70%)',
        }} />
      </motion.div>
      <motion.div style={{ y: orb2y }}
        className="absolute -bottom-[20%] -right-[15%] w-[800px] h-[800px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <div className="w-full h-full rounded-full" style={{
          background: 'radial-gradient(circle at center,rgba(0,200,200,0.10) 0%,rgba(0,200,200,0.03) 40%,transparent 70%)',
        }} />
      </motion.div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
        backgroundSize: '100% 4px',
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════
   NAV
═══════════════════════════════════════ */

function LiveTicker() {
  const msgs = [
    '0x1a2b → SlayMonster +50 tkn',
    '0x9f3c → WorkoutBadge minted',
    '0x7e4d → Rank ↑ #12 sub-500ms',
    '0x5b1e → +30 pts no polling',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % msgs.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">Live</span>
      <AnimatePresence mode="wait">
        <motion.span key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.25 }}
          className="text-[11px] font-mono text-slate-500"
        >{msgs[i]}</motion.span>
      </AnimatePresence>
    </div>
  );
}

function Nav({ scrollY }: { scrollY: MotionValue<number> }) {
  const bg = useTransform(scrollY, [0, 80], ['rgba(5,3,16,0)', 'rgba(5,3,16,0.9)']);
  return (
    <motion.nav style={{ backgroundColor: bg }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-4 h-4 text-violet-400" />
          </motion.div>
          <span className="text-[11px] font-mono tracking-[0.25em] text-white/90 uppercase">ReactRewards</span>
        </div>
        <div className="hidden lg:block"><LiveTicker /></div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-slate-600 hidden sm:block tracking-widest">SOMNIA TESTNET</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════
   HERO
═══════════════════════════════════════ */

function Hero({ scrollY }: { scrollY: MotionValue<number> }) {
  const yText = useTransform(scrollY, [0, 600], [0, 150]);
  const fadeOut = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <motion.div style={{ y: yText, opacity: fadeOut }} className="text-center relative z-10 w-full">

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 mb-10 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-950/40 backdrop-blur-sm"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-violet-300/80 uppercase">
            Somnia Native · Push-Based · On-Chain
          </span>
        </motion.div>

        {/* REACTIVE — character stagger */}
        <div className="overflow-hidden mb-1">
          <div className="flex flex-wrap justify-center leading-[0.88] tracking-[-0.04em]"
            style={{ fontFamily: "'Bebas Neue', 'Anton', sans-serif" }}>
            {'REACT'.split('').map((c, i) => (
              <motion.span key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="text-[13vw] md:text-[10vw] lg:text-[9rem] xl:text-[11rem] font-black"
                style={{
                  background: 'linear-gradient(180deg,#ffffff 30%,rgba(255,255,255,0.25) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >{c}</motion.span>
            ))}
          </div>
        </div>

        {/* REWARDS */}
        <div className="overflow-hidden mb-10">
          <div className="flex flex-wrap justify-center leading-[0.88] tracking-[-0.04em]"
            style={{ fontFamily: "'Bebas Neue', 'Anton', sans-serif" }}>
            {'REWARDS'.split('').map((c, i) => (
              <motion.span key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.55 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                className="text-[13vw] md:text-[10vw] lg:text-[9rem] xl:text-[11rem] font-black"
                style={{
                  background: 'linear-gradient(180deg,#a78bfa 0%,rgba(99,60,220,0.35) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >{c}</motion.span>
            ))}
          </div>
        </div>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="text-base md:text-xl text-slate-400/80 max-w-xl mx-auto leading-relaxed mb-10"
          style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300 }}
        >
          Set <span className="text-violet-300">When → Then</span> rules.
          Scores, tokens &amp; leaderboards update in{' '}
          <span className="text-cyan-300">under 1 second</span>.
          Zero keepers. Zero polling.{' '}
          <span className="text-emerald-300">100% on-chain</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('arena-demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative overflow-hidden px-8 py-4 rounded-full text-sm font-mono tracking-widest text-white uppercase"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700" />
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0) 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Enter Arena <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('problem-solution')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-full text-sm font-mono tracking-widest text-slate-500 border border-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            How It Works
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        style={{ opacity: fadeOut }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="w-4 h-4 text-slate-700" />
        </motion.div>
        <span className="text-[9px] font-mono tracking-[0.35em] text-slate-700 uppercase">Scroll</span>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050310] to-transparent z-10 pointer-events-none" />
    </section>
  );
}

/* ═══════════════════════════════════════
   STICKY PROBLEM / SOLUTION
   Left text pins · Right visual scrolls
═══════════════════════════════════════ */

function ProblemVisual() {
  return (
    <div className="w-full h-full bg-[#0a0518]/80 backdrop-blur-sm p-8 flex flex-col justify-center">
      <div className="text-[10px] font-mono text-red-400/50 mb-5 tracking-widest">// legacy_reward_system.js</div>
      {[
        { text: 'user.performAction()', color: 'text-slate-300' },
        { text: '// waiting for keeper bot...', color: 'text-red-400/60' },
        { text: '// polling every 30s...', color: 'text-red-400/60' },
        { text: '// off-chain server processing...', color: 'text-red-400/60' },
        { text: '// 2-5 minutes later...', color: 'text-slate-600' },
        { text: 'reward.maybe_update() ❌', color: 'text-red-400' },
      ].map((l, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`text-sm font-mono py-1.5 ${l.color}`}
        >{l.text}</motion.div>
      ))}
    </div>
  );
}

function SomniaVisual() {
  return (
    <div className="w-full h-full bg-[#0a0518]/80 backdrop-blur-sm p-8 flex flex-col justify-center">
      <div className="text-[10px] font-mono text-violet-400/50 mb-5 tracking-widest">// SomniaEventHandler.sol</div>
      {[
        { text: 'contract ReactiveReward is', color: 'text-violet-300' },
        { text: '    SomniaEventHandler {', color: 'text-violet-300' },
        { text: '  function onEvent(', color: 'text-slate-400' },
        { text: '    bytes32 sig, address user', color: 'text-cyan-300/70' },
        { text: '  ) external override {', color: 'text-slate-400' },
        { text: '    // push-based ← no polling', color: 'text-emerald-400/60' },
        { text: '    _executeReward(user); ✓', color: 'text-emerald-300' },
        { text: '}}', color: 'text-violet-300' },
      ].map((l, i) => (
        <motion.div key={i}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ delay: i * 0.07 }}
          className={`text-sm font-mono py-1 ${l.color}`}
        >{l.text}</motion.div>
      ))}
    </div>
  );
}

function SolutionVisual() {
  const steps = ['User Action', 'Event Emitted', 'SDK Triggered', 'Reward Minted'];
  const colors = ['#a78bfa', '#818cf8', '#38bdf8', '#34d399'];
  return (
    <div className="w-full h-full bg-[#0a0518]/80 backdrop-blur-sm p-8 flex flex-col justify-center gap-4">
      <div className="text-[10px] font-mono text-cyan-400/50 mb-2 tracking-widest">// reactive_pipeline — live</div>
      {steps.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors[i], boxShadow: `0 0 8px ${colors[i]}` }}
          />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${colors[i]}40,transparent)` }} />
          <span className="text-sm font-mono text-slate-300">{s}</span>
        </motion.div>
      ))}
      <div className="mt-3 px-3 py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sub-500ms · No external calls · Trustless
        </div>
      </div>
    </div>
  );
}

/* Panel data */
const PANELS = [
  {
    tag: '01 — THE PROBLEM',
    title: 'Legacy rewards are\nfundamentally broken.',
    body: 'Every web3 game, DeFi protocol, and social dApp relies on off-chain bots, keepers, and constant polling. Slow, expensive, and not truly decentralized.',
    accent: '#ef4444',
    items: ['Off-chain keepers required', 'Minutes-late updates', 'Single points of failure', 'Not trustless'],
    Visual: ProblemVisual,
  },
  {
    tag: '02 — THE SHIFT',
    title: 'Somnia Reactivity changes\nthe paradigm.',
    body: "Somnia's native Reactivity layer lets smart contracts listen and react to on-chain events — push-based, sub-second, with zero external infrastructure.",
    accent: '#a78bfa',
    items: ['Push-based validators', 'SomniaEventHandler primitive', 'Rules execute < 500ms', 'Composable across any dApp'],
    Visual: SomniaVisual,
  },
  {
    tag: '03 — THE SOLUTION',
    title: 'ReactRewards: a reusable\nreward primitive.',
    body: 'A modular infrastructure layer any Somnia builder integrates in minutes. Define When → Then rules. Tokens, badges, scores — all triggered automatically.',
    accent: '#22d3ee',
    items: ['Visual rule builder', 'ERC20 tokens + badge NFTs', 'Live leaderboard on-chain', 'Zero external dependencies'],
    Visual: SolutionVisual,
  },
];

function StickyPanels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
 


  return (
    <section
      id="problem-solution"
      ref={containerRef}
      style={{ height: `${PANELS.length * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen flex overflow-hidden">

        {/* LEFT: pinned, panels fade in/out */}
        <div className="w-full lg:w-1/2 relative flex items-center">
          {PANELS.map((p, i) => {
            const n = PANELS.length;
            const s = i / n;
            const e = (i + 1) / n;
            const lp = useTransform(scrollYProgress, [s, e], [0, 1]);
            const y = useTransform(lp, [0, 1], [70, -70]);
            const op = useTransform(lp, [0, 0.13, 0.85, 1], [0, 1, 1, 0]);

            return (
              <motion.div key={i} style={{ y, opacity: op }}
                className="absolute left-8 md:left-16 lg:left-20 right-8 md:right-12"
              >
                <div className="text-[10px] font-mono tracking-[0.3em] mb-5 uppercase"
                  style={{ color: p.accent }}>{p.tag}</div>
                <h3 className="text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white mb-6 whitespace-pre-line"
                  style={{ fontFamily: "'Bebas Neue','Anton',sans-serif" }}
                >{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-md"
                  style={{ fontFamily: "'DM Mono',monospace", fontWeight: 300 }}
                >{p.body}</p>
                <ul className="space-y-3">
                  {p.items.map((item, j) => (
                    <motion.li key={j}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.07 }}
                      className="flex items-center gap-3 text-xs font-mono text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.accent }} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT: pinned visual that swaps */}
        <div className="hidden lg:flex w-1/2 items-center justify-center relative">
          {PANELS.map((p, i) => {
            const n = PANELS.length;
            const s = i / n;
            const e = (i + 1) / n;
            const lp = useTransform(scrollYProgress, [s, e], [0, 1]);
            const y = useTransform(lp, [0, 1], [90, -90]);
            const op = useTransform(lp, [0, 0.12, 0.86, 1], [0, 1, 1, 0]);
            const sc = useTransform(lp, [0, 0.12, 0.86, 1], [0.9, 1, 1, 0.9]);
            return (
              <motion.div key={i} style={{ y, opacity: op, scale: sc }}
                className="absolute w-[440px] h-[360px] rounded-3xl border border-white/[0.07] overflow-hidden"
              >
                <div className="absolute inset-0" style={{
                  background: `radial-gradient(ellipse at 30% 40%,${p.accent}18 0%,transparent 60%)`,
                }} />
                <p.Visual />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FEATURE CARDS — FLY IN FROM SIDES
═══════════════════════════════════════ */

function FlyCard({
  children, from, delay, className = '',
}: {
  children: React.ReactNode;
  from: 'left' | 'right' | 'bottom';
  delay: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const x = from === 'left' ? -110 : from === 'right' ? 110 : 0;
  const y = from === 'bottom' ? 80 : 0;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x, y, scale: 0.95 }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: 'Sub-Second Execution', body: 'Push-based validators trigger reward logic the moment an event fires. No waiting.', accent: '#a78bfa', from: 'left' as const },
  { icon: <Shield className="w-5 h-5" />, title: 'Fully Trustless', body: 'Every rule, score, and badge lives in auditable smart contracts. No admin keys.', accent: '#22d3ee', from: 'bottom' as const },
  { icon: <Cpu className="w-5 h-5" />, title: 'Zero Polling', body: 'SomniaEventHandler receives events via native reactivity. No servers required.', accent: '#34d399', from: 'right' as const },
  { icon: <Globe className="w-5 h-5" />, title: 'Reusable Primitive', body: 'Any GameFi, DeFi, or SocialFi dApp on Somnia integrates ReactRewards in minutes.', accent: '#f59e0b', from: 'left' as const },
  { icon: <Activity className="w-5 h-5" />, title: 'Visual Rule Builder', body: 'No-code When → Then. Drag, drop, deploy. Rules go live on-chain instantly.', accent: '#ec4899', from: 'bottom' as const },
  { icon: <Sword className="w-5 h-5" />, title: 'ERC20 + Badge NFTs', body: 'Mint fungible rewards and unique achievement badges atomically in one reaction.', accent: '#a78bfa', from: 'right' as const },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-[10px] font-mono tracking-[0.35em] text-violet-400/70 uppercase mb-4">Core Capabilities</div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white"
              style={{ fontFamily: "'Bebas Neue','Anton',sans-serif" }}
            >Built different.</h2>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FlyCard key={i} from={f.from} delay={i * 0.07}>
              <div className="group relative h-full p-7 rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden cursor-default">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 30% 40%,${f.accent}14 0%,transparent 70%)` }} />
                <div className="absolute top-0 right-0 w-16 h-16 opacity-20"
                  style={{ background: `radial-gradient(circle at top right,${f.accent} 0%,transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: `${f.accent}18`, color: f.accent }}
                  >{f.icon}</div>
                  <h4 className="text-sm font-semibold text-white mb-2 tracking-tight"
                    style={{ fontFamily: "'DM Mono',monospace" }}
                  >{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
                </div>
                <motion.div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg,transparent,${f.accent}60,transparent)` }} />
              </div>
            </FlyCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   ECOSYSTEM — STICKY CIRCULAR PROGRESS
═══════════════════════════════════════ */

const USE_CASES = [
  { label: 'GameFi', icon: '🎮', color: '#a78bfa', examples: ['Kill streaks → token rain', 'Quest complete → badge NFT', 'Daily login → score boost'] },
  { label: 'DeFi Loyalty', icon: '💰', color: '#22d3ee', examples: ['Swap volume → tier upgrade', 'LP duration → bonus APY', 'Referral → ERC20 reward'] },
  { label: 'SocialFi', icon: '🌐', color: '#34d399', examples: ['Post viral → reputation XP', 'Follow milestone → badge', 'DAO vote → governance pts'] },
  { label: 'AI Agents', icon: '🤖', color: '#f59e0b', examples: ['Task completed → incentive', 'Accuracy milestone → token', 'Collaboration → shared reward'] },
];

function EcosystemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const circumference = 2 * Math.PI * 170;
  const ringDash = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

  return (
    <section ref={containerRef} style={{ height: `${USE_CASES.length * 90}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex items-stretch overflow-hidden">

        {/* LEFT */}
        <div className="w-full lg:w-1/2 relative flex items-center">
          {USE_CASES.map((uc, i) => {
            const n = USE_CASES.length;
            const s = i / n;
            const e = (i + 1) / n;
            const lp = useTransform(scrollYProgress, [s, e], [0, 1]);
            const y = useTransform(lp, [0, 1], [70, -70]);
            const op = useTransform(lp, [0, 0.13, 0.85, 1], [0, 1, 1, 0]);
            return (
              <motion.div key={i} style={{ y, opacity: op }}
                className="absolute left-8 md:left-16 lg:left-20 right-8 md:right-12"
              >
                <div className="text-5xl mb-5">{uc.icon}</div>
                <div className="text-[10px] font-mono tracking-[0.3em] mb-3 uppercase"
                  style={{ color: uc.color }}>Use Case {String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-7"
                  style={{ fontFamily: "'Bebas Neue','Anton',sans-serif" }}
                >{uc.label}</h3>
                <div className="space-y-3">
                  {uc.examples.map((ex, j) => (
                    <motion.div key={j}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.1 }}
                      className="flex items-center gap-3 text-sm font-mono text-slate-300"
                    >
                      <span className="text-xs tracking-widest font-mono" style={{ color: uc.color }}>→</span>
                      {ex}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT: ring + icon */}
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <div className="relative w-[380px] h-[380px]">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 380 380">
              <circle cx="190" cy="190" r="170" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <motion.circle cx="190" cy="190" r="170" fill="none"
                stroke="url(#rg)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: ringDash }}
              />
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {USE_CASES.map((uc, i) => {
                const n = USE_CASES.length;
                const lp = useTransform(scrollYProgress, [i / n, (i + 1) / n], [0, 1]);
                const op = useTransform(lp, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
                const sc = useTransform(lp, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);
                return (
                  <motion.div key={i} style={{ opacity: op, scale: sc }}
                    className="absolute text-center"
                  >
                    <div className="text-7xl mb-3">{uc.icon}</div>
                    <div className="text-2xl font-black tracking-tight"
                      style={{ fontFamily: "'Bebas Neue','Anton',sans-serif", color: uc.color }}
                    >{uc.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   DEMO APP SECTION
═══════════════════════════════════════ */

function AppTab({ id, label, icon, active, onClick }: {
  id: string; label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-wide transition-all duration-200 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {active && (
        <motion.div layoutId="tab-indicator"
          className="absolute inset-0 rounded-xl bg-violet-600/50 border border-violet-500/30"
          transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}


function WalletBtn() {
  // We use your existing global store!
  const { userAddress, setUserAddress } = useAppStore();

  const connectDirectly = async () => {
    // 1. Check if the browser has a Web3 wallet extension injected
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        console.log("Forcing native Web3 connection...");
        const eth = (window as any).ethereum;
        
        // 2. Ask MetaMask for accounts
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        
        // 3. FORCE METAMASK TO SWITCH TO SOMNIA TESTNET
        const somniaChainIdHex = '0xc488'; // 50312 in Hex
        
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: somniaChainIdHex }],
          });
        } catch (switchError: any) {
          // 4. If the user doesn't have Somnia added to MetaMask, add it automatically!
          if (switchError.code === 4902) {
            console.log("Adding Somnia Testnet to wallet...");
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: somniaChainIdHex,
                  chainName: 'Somnia Testnet',
                  rpcUrls: ['https://dream-rpc.somnia.network/'],
                  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
                  blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
                },
              ],
            });
          } else {
            throw switchError; // Throw other errors (like user rejecting the switch)
          }
        }

        // 5. Save the address directly to your app's state
        if (accounts.length > 0) {
          console.log("Successfully connected on Somnia:", accounts[0]);
          setUserAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Connection failed or user rejected:", err);
      }
    } else {
      alert("No Web3 wallet detected! Please install MetaMask.");
    }
  };

  // If we have an address in the store, show the disconnect button
  if (userAddress && userAddress !== "0x0" && userAddress !== "0x742d35Cc6634C0532925a3b844Bc9e7595f42838") {
    return (
      <button 
        onClick={() => setUserAddress(null)} 
        type="button" 
        className="group relative px-6 py-3 bg-[#050505] border border-white/10 text-sky-400 font-mono text-sm tracking-widest uppercase hover:border-red-500 hover:text-red-400 transition-all duration-300" 
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {userAddress.slice(0, 6)}...{userAddress.slice(-4)} (Disconnect)
      </button>
    );
  }

  // Default Connect Button
  return (
    <button 
      onClick={connectDirectly} 
      type="button" 
      className="group relative px-8 py-4 bg-sky-500 text-black font-mono text-sm tracking-widest uppercase hover:bg-sky-400 transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]" 
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <span className="flex items-center gap-2 font-bold">
        Initialize Connection <Terminal className="w-4 h-4" />
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════ */

export default function Home() {
  const { scrollY } = useScroll();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading] = useState(false);
  // const [walletConnected, setWalletConnected] = useState(false);
  const { isConnected: walletConnected, address: wagmiAddress } = useAccount();
  const [activeTab, setActiveTab] = useState('arena');

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [onChainActions, setOnChainActions] = useState<any[]>([]);

  

  const {
     currentScore, currentRank, achievements,
    activePipelineEvent, leaderboard,
     setCurrentScore, setCurrentRank,
    setActivePipelineEvent, setLeaderboard,
  } = useAppStore();

  useEffect(() => {
    setLeaderboard([
      { rank: 1, address: '0x1111111111111111111111111111111111111111' as `0x${string}`, score: BigInt(500), achievements: 5 },
      { rank: 2, address: '0x2222222222222222222222222222222222222222' as `0x${string}`, score: BigInt(450), achievements: 4 },
      { rank: 3, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42838' as `0x${string}`, score: BigInt(150), achievements: 1 },
      { rank: 4, address: '0x3333333333333333333333333333333333333333' as `0x${string}`, score: BigInt(100), achievements: 2 },
    ]);
    setCurrentScore(BigInt(150));
    setCurrentRank(3);
  }, []);

  // const connectWallet = () => {
  //   setUserAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f42838');
  //   setWalletConnected(true);
  // };
  
  useEffect(() => {
    if (walletConnected && wagmiAddress) {
      setUserAddress(wagmiAddress);
    } else {
      setUserAddress(null);
    }
  }, [walletConnected, wagmiAddress, setUserAddress]);

// ----------------------------------------------------------------------------------------------------

  const executeAction = async (eventName: string, reward: string) => {
    if (isProcessing) return;
    
    // Safety check: Make sure wallet is connected
    if (!window.ethereum || !userAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsProcessing(true);
    setActiveTab('pipeline');
    const id = `${Date.now()}`;

    try {
      // 1. UI: Show User Action started
      setActivePipelineEvent({
        id, step: PipelineStep.USER_ACTION,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: true
      });

      // 2. Setup Ethers.js & Network Enforcer
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      console.log("Ethers sees Chain ID:", network.chainId);
      
      if (network.chainId !== 50312n) {
        alert("Your browser is still caching the old network! Please do a hard refresh (Ctrl+Shift+R) and reconnect.");
        setIsProcessing(false);
        setActiveTab('arena');
        return;
      }
      
      // Double check that the contract actually exists on this chain
      const code = await provider.getCode(CONTRACT_ADDRESSES.ENGINE);
      if (code === "0x") {
        throw new Error(`CRITICAL: Contract not found at ${CONTRACT_ADDRESSES.ENGINE}. Is constants.ts correct?`);
      }
      
      const signer = await provider.getSigner();
      const engineContract = new ethers.Contract(CONTRACT_ADDRESSES.ENGINE, REACTIVE_REWARD_ENGINE_ABI, signer);
      const handlerContract = new ethers.Contract(CONTRACT_ADDRESSES.HANDLER, EVENT_HANDLER_ABI, provider);

      // ==========================================
      // 3. THE REACTIVITY LISTENER
      // ==========================================
      const waitForReactivity = new Promise((resolve) => {
        const listener = (user: string, emittedEventName: string) => {
          if (user.toLowerCase() === userAddress.toLowerCase() && emittedEventName === eventName) {
            console.log(" REAL REACTIVITY DETECTED ON-CHAIN! ");
            handlerContract.off("ReactionProcessed", listener);
            resolve(true);
          }
        };
        handlerContract.on("ReactionProcessed", listener);
        
        // 15 second fallback in case the Testnet WebSocket drops the event
        setTimeout(() => {
          handlerContract.off("ReactionProcessed", listener);
          console.log("Reactivity timeout: Proceeding via fallback.");
          resolve(false); 
        }, 15000);
      });
      // ==========================================

      // 4. UI: Event Emitted (Prompting MetaMask)
      setActivePipelineEvent({
        id, step: PipelineStep.EVENT_EMITTED,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: true
      });

      // 5. THE REAL BLOCKCHAIN CALL
      console.log(`Sending transaction to emit: ${eventName}...`);
      const tx = await engineContract.emitCustomEvent(eventName, "{}");

      // 6. UI: SDK Triggered
      setActivePipelineEvent({
        id, step: PipelineStep.SDK_TRIGGERED,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: true
      });

      console.log("Waiting for block confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction mined!", receipt);

      // 7. UI: Condition Checked
      setActivePipelineEvent({
        id, step: PipelineStep.CONDITION_CHECKED,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: true
      });

      // HALT PIPELINE: Wait for the Reactivity SDK to report back!
      console.log("Waiting for Somnia Reactivity SDK to process...");
      await waitForReactivity;

      // 8. UI: Action Executed
      setActivePipelineEvent({
        id, step: PipelineStep.ACTION_EXECUTED,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: true
      });
      await new Promise(r => setTimeout(r, 400)); // Tiny visual delay

      // 9. UI: State Updated (Success!)
      const ra = BigInt(parseInt(reward));
      setActivePipelineEvent({
        id, step: PipelineStep.STATE_UPDATED,
        user: (userAddress || '0x0') as `0x${string}`,
        eventName, timestamp: Date.now(), isActive: false, completedAt: Date.now(),
        data: { 
          rewardAmount: ra, 
          badgeName: eventName === 'CompleteWorkout' ? 'Fitness Master' : undefined, 
          oldRank: currentRank, 
          newRank: Math.max(1, currentRank - 1) 
        }
      });

      // Update Local Dashboard Numbers
      const ns = currentScore + ra;
      const nr = Math.max(1, currentRank - 1);
      setCurrentScore(ns);
      setCurrentRank(nr);
      setLeaderboard(leaderboard.map(e =>
        e.address === userAddress
          ? { ...e, rank: nr, score: ns, achievements: e.achievements + 1 }
          : e
      ));

      // Wait a second so the user can see the success state, then switch to leaderboard
      await new Promise(r => setTimeout(r, 1500));
      setActiveTab('leaderboard');

    } catch (error: any) {
      console.error("Transaction failed or was rejected:", error);
      alert("Transaction failed! " + (error.shortMessage || error.message));
      setActiveTab('arena'); // Kick them back to the arena tab on failure
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------

const fetchRules = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const engine = new ethers.Contract(CONTRACT_ADDRESSES.ENGINE, REACTIVE_REWARD_ENGINE_ABI, provider);
      const count = await engine.getRuleCounter();
      const rules = [];
      
      for (let i = 0; i < Number(count); i++) {
        const rule = await engine.getRule(i);
        if (rule.isActive) {
          rules.push({
            label: rule.eventName,
            eventName: rule.eventName,
            desc: rule.badgeMetadata || "Somnia Reactive Rule",
            hint: `+${rule.rewardAmount.toString()} ${Number(rule.actionType) === 0 ? 'Tokens' : 'Points'}`,
            reward: rule.rewardAmount.toString(),
            icon: Number(rule.actionType) === 1 ? '🏆' : '⚔️',
          });
        }
      }
      setOnChainActions(rules);
    } catch (err) { console.error("Fetch Rules Error:", err); }
  };

  // Trigger fetch when wallet connects
  useEffect(() => {
    if (userAddress && userAddress !== "0x0") fetchRules();
  }, [userAddress]);
  
// --------------------------------------------------------------------------------------------------------------------------

const handleRuleSubmit = async (formData: RuleFormData) => {
    console.log("1. Starting deployment with data:", formData);
    
    if (!window.ethereum || !userAddress) {
      return alert("Please connect your wallet first!");
    }

    try {
      console.log("2. Setting up provider...");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      console.log("3. Creating contract instances...");
      const engine = new ethers.Contract(CONTRACT_ADDRESSES.ENGINE, REACTIVE_REWARD_ENGINE_ABI, signer);
      const handler = new ethers.Contract(CONTRACT_ADDRESSES.HANDLER, EVENT_HANDLER_ABI, signer);

      console.log("4. Formatting arguments safely for Ethers v6...");
      // Map UI string to Solidity enum (uint8)
      const actionType = formData.rewardType === 'token' ? 0 : formData.rewardType === 'badge' ? 1 : 2;
      
      // Ensure strings are never undefined, and numbers are cast to BigInt for uint256
      const safeEventTrigger = formData.eventTrigger || "UnknownEvent";
      const safeRewardAmount = actionType === 1 ? 0n : BigInt(parseInt(formData.rewardValue) || 0);
      const safeBadgeName = actionType === 1 ? (formData.rewardValue || "Mystery Badge") : "";

      console.log("5. Sending tx1 (registerRule)...");
      const tx1 = await engine.registerRule(
        safeEventTrigger,
        "always",
        actionType,
        safeRewardAmount,
        safeBadgeName,
        "Deployed via RuleBuilder"
      );

      console.log("6. Waiting for tx1 to mine...");
      await tx1.wait();

      console.log("7. Fetching new Rule ID...");
      const currentRuleCount = await engine.getRuleCounter();
      const ruleId = Number(currentRuleCount) - 1;

      console.log(`8. Sending tx2 (subscribeToRule) for Rule ID: ${ruleId}...`);
      const tx2 = await handler.subscribeToRule(ruleId, safeEventTrigger);

      console.log("9. Waiting for tx2 to mine...");
      await tx2.wait();

      console.log("10. Success! Refreshing UI...");
      alert("✅ Rule successfully deployed and subscribed on-chain!");
      
      await fetchRules(); 
      setActiveTab('arena'); 

    } catch (error: any) {
      console.error("❌ FULL DEPLOYMENT ERROR:", error);
      alert("Deployment failed: " + (error.shortMessage || error.message || "Unknown error"));
    }
  };
 

  const ACTIONS = [
    { label: 'Slay Monster', eventName: 'SlayMonster', desc: 'Defeat an enemy in the arena', hint: '+50 tokens', reward: '50', icon: '⚔️' },
    { label: 'Complete Workout', eventName: 'CompleteWorkout', desc: 'Finish an exercise session', hint: '+30 pts + Badge', reward: '30', icon: <Dumbbell className="w-5 h-5" /> },
    { label: 'Meditation', eventName: 'MeditationSession', desc: 'Complete mindfulness session', hint: '+20 pts', reward: '20', icon: <Brain className="w-5 h-5" /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        html { scroll-behavior: smooth; }
        body { background: #050310; overflow-x: hidden; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
      `}</style>

      <GrainOverlay />
      <CursorGlow />
      <MeshBackground scrollY={scrollY} />

      <div className="relative z-10" style={{ fontFamily: "'DM Mono',monospace" }}>

        <Nav scrollY={scrollY} />
        <Hero scrollY={scrollY} />
        <StickyPanels />
        <FeaturesSection />
        <EcosystemSection />

        {/* ══ DEMO SECTION ══ */}
        <section id="arena-demo" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <FlyCard from="bottom" delay={0}>
              <div className="text-center mb-20">
                <div className="text-[10px] font-mono tracking-[0.35em] text-violet-400/70 uppercase mb-4">Interactive Demo</div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-5"
                  style={{ fontFamily: "'Bebas Neue','Anton',sans-serif" }}
                >Try it live.</h2>
                <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
                  Trigger on-chain events. Watch the reactive pipeline fire in real-time.
                  Earn tokens and badges — zero off-chain calls.
                </p>
              </div>
            </FlyCard>

            {/* Wallet gate */}
            <AnimatePresence mode="wait">
              {!walletConnected ? (
                <motion.div key="gate"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-3xl border border-dashed border-violet-500/15 overflow-hidden"
                >
                  <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
                    animate={{ boxShadow: [
                      '0 0 0 1px rgba(139,92,246,0.08), inset 0 0 60px rgba(99,60,220,0.03)',
                      '0 0 0 1px rgba(139,92,246,0.22), inset 0 0 100px rgba(99,60,220,0.07)',
                      '0 0 0 1px rgba(139,92,246,0.08), inset 0 0 60px rgba(99,60,220,0.03)',
                    ] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                  />
                  <div className="relative py-28 flex flex-col items-center text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-20 h-20 rounded-2xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center mb-8"
                    >
                      <Zap className="w-9 h-9 text-violet-400" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight"
                      style={{ fontFamily: "'Bebas Neue','Anton',sans-serif" }}
                    >Connect to enter the arena</h3>
                    <p className="text-xs text-slate-500 mb-10 max-w-xs leading-relaxed">
                      Connect your wallet to experience reactive rewards running live on Somnia testnet.
                    </p>
                    <WalletBtn />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="app"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Profile */}
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <UserProfile address={userAddress || undefined} score={currentScore} rank={currentRank} achievements={achievements.length} />
                  </motion.div>

                  {/* Tabs */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] w-fit"
                  >
                    {[
                      { id: 'arena', label: 'Arena', icon: <Sword className="w-3.5 h-3.5" /> },
                      { id: 'pipeline', label: 'Pipeline', icon: <Activity className="w-3.5 h-3.5" /> },
                      { id: 'leaderboard', label: 'Leaderboard', icon: <Zap className="w-3.5 h-3.5" /> },
                      { id: 'rules', label: 'Rule Builder', icon: <Cpu className="w-3.5 h-3.5" /> },
                    ].map(t => (
                      <AppTab key={t.id} {...t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                    ))}
                  </motion.div>

                  
                 {/* Panels */}
                <AnimatePresence mode="wait">
                  {/* --- ARENA TAB --- */}
                  {activeTab === 'arena' && (
                    <motion.div key="arena-panel"
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 25 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {onChainActions.length > 0 ? (
                        onChainActions.map((a, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 35 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => !isProcessing && executeAction(a.eventName, a.reward)}
                            className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden cursor-pointer hover:border-violet-500/25 transition-colors duration-300"
                            whileHover={{ y: -3 }}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{ background: 'radial-gradient(ellipse at 50% 110%,rgba(99,60,220,0.1) 0%,transparent 70%)' }} />
                            
                            <div className="text-3xl mb-4">{a.icon}</div>
                            <div className="text-sm font-semibold text-white mb-1">{a.label}</div>
                            <div className="text-[11px] text-slate-500 mb-5">{a.desc}</div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                                {a.hint}
                              </span>
                              {isProcessing ? (
                                <div className="w-4 h-4 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
                              ) : (
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        /* Empty state if no rules are on-chain */
                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                          <p className="text-slate-500 font-mono text-xs">No on-chain rules detected.</p>
                          <p className="text-slate-600 text-[10px] mt-2">Deploy a rule in the Builder to see it here.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* --- PIPELINE TAB --- */}
                  {activeTab === 'pipeline' && (
                    <motion.div key="pipeline-panel"
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 25 }}
                      transition={{ duration: 0.38 }}
                    >
                      <EventPipelineVisualizer event={activePipelineEvent} isProcessing={isProcessing} />
                      {!isProcessing && !activePipelineEvent && (
                        <div className="mt-8 text-center text-xs font-mono text-slate-700 py-8 border border-dashed border-white/[0.04] rounded-2xl">
                          ← Go to Arena and trigger an action to see the reactive pipeline fire
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* --- LEADERBOARD TAB --- */}
                  {activeTab === 'leaderboard' && (
                    <motion.div key="lb-panel"
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 25 }}
                      transition={{ duration: 0.38 }}
                    >
                      <LeaderboardLive entries={leaderboard} currentUserAddress={(userAddress as `0x${string}`) || undefined} isLoading={false} />
                    </motion.div>
                  )}

                  {/* --- RULES TAB --- */}
                  {activeTab === 'rules' && (
                    <motion.div key="rules-panel"
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 25 }}
                      transition={{ duration: 0.38 }}
                      className="max-w-2xl"
                    >
                      <div className="mb-6 p-5 rounded-2xl border border-white/[0.05] bg-white/[0.01]">
                        <div className="text-xs font-semibold text-white mb-1">Create Custom Rule</div>
                        <div className="text-[11px] text-slate-500">Define a When → Then rule. Deploy it. It runs on-chain, forever, with zero maintenance.</div>
                      </div>
                      <RuleForm onSubmit={handleRuleSubmit} isLoading={isLoading} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint */}
                <div className="text-[10px] font-mono text-slate-700 flex items-center gap-2 mt-6">
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  Actions auto-switch to Pipeline · Pipeline resolves then switches to Leaderboard
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

        {/* ══ FINAL CTA ══ */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center,rgba(99,60,220,0.1) 0%,transparent 65%)' }} />
          <FlyCard from="bottom" delay={0}>
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <div className="text-[10px] font-mono tracking-[0.35em] text-violet-400/70 uppercase mb-5">The Foundation Layer</div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6"
                style={{
                  fontFamily: "'Bebas Neue','Anton',sans-serif",
                  background: 'linear-gradient(135deg,#fff 0%,#a78bfa 60%,#22d3ee 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >The reward primitive Somnia needed.</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xl mx-auto mb-10">
                ReactRewards isn't just one app — it's a reusable infrastructure primitive.
                Any GameFi, DeFi, SocialFi, or AI agent protocol on Somnia integrates reactive rewards in minutes.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <WalletBtn />
                <motion.a href="#" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-full text-xs font-mono tracking-[0.2em] text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all uppercase"
                >View Contracts ↗</motion.a>
              </div>
            </div>
          </FlyCard>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="py-8 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-slate-600 uppercase">ReactRewards</span>
            </div>
            <p className="text-[10px] font-mono text-slate-700 text-center">
              No polling · No keepers · No external infra · Powered by Somnia Reactivity
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-700">Somnia Testnet</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}