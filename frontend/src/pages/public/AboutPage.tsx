import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Award, Users, MapPin, CheckCircle2, ChevronRight, Mail } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import type { LeadershipMember } from '../../types';

function getInitials(name: string): string {
  const clean = name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.|CA|Smt\.)\s*/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DEFAULT_EXECUTIVE_MEMBERS: LeadershipMember[] = [
  {
    id: 1,
    name: "Smt. Jayashree Mohta",
    designation: "Hon'ble Chancellor",
    category: "executive",
    bio: "Exemplifies the vision of holistic education with Indian values, fostering athletic discipline, innovation, and national heritage across Birla institutions.",
    image_url: "/images/leadership/jayashree_mohta.jpg",
    display_order: 1,
    is_active: true,
    contact_email: "chancellor@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    name: "CA Bijay Kumar Dalan",
    designation: "Hon'ble Pro-Chancellor",
    category: "executive",
    bio: "Hon'ble Secretary of Bharat Arogya & Gyan Mandir, spearheading modern education, infrastructural expansion, and inter-collegiate athletic engagement.",
    image_url: "/images/leadership/bk_dalan.png",
    display_order: 2,
    is_active: true,
    contact_email: "prochancellor@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 3,
    name: "Prof. (Dr.) Gopal Pathak",
    designation: "Hon'ble Director General",
    category: "executive",
    bio: "Eminent academician & administrator, former Vice-Chancellor of SBU and founding VC of Jharkhand University of Technology (JUT). Champion of student sports culture and youth empowerment.",
    image_url: "/images/leadership/gopal_pathak.png",
    display_order: 3,
    is_active: true,
    contact_email: "dg@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 4,
    name: "Prof. (Dr.) Jeganathan Chockalingam",
    designation: "Hon'ble Vice-Chancellor",
    category: "executive",
    bio: "Drives the university toward competitive global excellence while maintaining ethical grounding, teamwork, sportsmanship, and student health.",
    image_url: "/images/leadership/jeganathan.jpg",
    display_order: 4,
    is_active: true,
    contact_email: "vc@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 5,
    name: "Prof. S. B. Dandin",
    designation: "Registrar",
    category: "executive",
    bio: "Oversees university administration and institutional governance, ensuring transparent management of athletic championships, campus infrastructure, and student welfare.",
    image_url: "/images/leadership/dandin.jpg",
    display_order: 5,
    is_active: true,
    contact_email: "registrar@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
];

const DEFAULT_SPORTS_INCHARGES: LeadershipMember[] = [
  {
    id: 6,
    name: "Prof. (Dr.) Neelima Pathak",
    designation: "Dean — Faculty of Arts, Culture & Sports",
    category: "sports",
    bio: "Leads academic and administrative stewardship of university sports, culture, and yogic sciences, mentoring student athletes in discipline, mental fortitude, and tournament excellence.",
    image_url: "/images/leadership/neelima_pathak.jpg",
    display_order: 6,
    is_active: true,
    contact_email: "neelima.pathak@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 7,
    name: "Mr. Subhash Narayan Shahdeo",
    designation: "Sports Officer / Chief Sports Incharge",
    category: "sports",
    bio: "Chief athletic administrator directing university inter-house sports tournaments, UMANG events, and external representation across state and national collegiate meets.",
    image_url: "/images/leadership/shah_deo.jpg",
    display_order: 7,
    is_active: true,
    contact_email: "sports.officer@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 8,
    name: "Mr. Rahul Ranjan",
    designation: "Deputy Sports Officer / Sports Incharge",
    category: "sports",
    bio: "Key sports incharge managing athletic grounds, AstroTurf facilities, equipment logistics, team selections, and referee coordination for all 13 UMANG disciplines.",
    image_url: undefined,
    display_order: 8,
    is_active: true,
    contact_email: "rahul.ranjan@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
  {
    id: 9,
    name: "Mr. Gaurav Kumar Das",
    designation: "Assistant Sports Officer / Sports Incharge",
    category: "sports",
    bio: "Key sports incharge coordinating student athlete fitness routines, tactical coaching sessions, arena match scheduling, and inter-house team lineups.",
    image_url: undefined,
    display_order: 9,
    is_active: true,
    contact_email: "gaurav.das@sbu.ac.in",
    created_at: "",
    updated_at: "",
  },
];

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const [executiveMembers, setExecutiveMembers] = useState<LeadershipMember[]>(DEFAULT_EXECUTIVE_MEMBERS);
  const [sportsIncharges, setSportsIncharges] = useState<LeadershipMember[]>(DEFAULT_SPORTS_INCHARGES);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getLeadership()
      .then((data) => {
        if (!isMounted) return;
        if (data.executive_members && data.executive_members.length > 0) {
          setExecutiveMembers(data.executive_members);
        }
        if (data.sports_incharges && data.sports_incharges.length > 0) {
          setSportsIncharges(data.sports_incharges);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic leadership members, using defaults:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingLeadership(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const houses = [
    {
      name: "Vishvesvaraya House",
      code: "VISH",
      color: "#1E40AF",
      motto: "Precision, Engineering & Unyielding Focus",
      symbol: "The Titan",
      desc: "Named after Sir M. Visvesvaraya, this house embodies strategic discipline, tactical brilliance, and calm execution under high pressure."
    },
    {
      name: "Chanakya House",
      code: "CHAN",
      color: "#800000",
      motto: "Strategy, Valour & Relentless Will",
      symbol: "The Strategist",
      desc: "Drawing inspiration from ancient India's greatest strategist, Chanakya House thrives on aggressive teamwork, mental toughness, and adaptability."
    },
    {
      name: "Patanjali House",
      code: "PATA",
      color: "#D97706",
      motto: "Endurance, Balance & Inner Power",
      symbol: "The Ascendant",
      desc: "Dedicated to the father of modern mindfulness and yoga, Patanjali House champions endurance sports, athletics stamina, and fair play."
    },
    {
      name: "Ramanujan House",
      code: "RAMA",
      color: "#059669",
      motto: "Intuition, Speed & Creative Mastery",
      symbol: "The Prodigy",
      desc: "Honoring the legendary mathematical genius Srinivasa Ramanujan, this house brings swift reflexes, unpredictability, and lightning agility."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-brand-primary/80 to-stone-950 p-8 sm:p-14 border border-stone-800 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Trophy size={13} />
            <span>SARALA BIRLA UNIVERSITY • ANNUAL SPORTS MEET</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight">
            About SBU UMANG Sports
          </h1>
          <p className="text-base text-stone-300 leading-relaxed">
            The flagship collegiate sports championship of Sarala Birla University, Ranchi. UMANG celebrates physical fitness, competitive sportsmanship, and inter-house camaraderie across more than a dozen athletic disciplines.
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">Inter-House Glory</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            All students and faculty compete under the banners of the four esteemed university houses, vying for points in the unified Championship Trophy.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary dark:text-amber-400 flex items-center justify-center font-bold">
            <Shield size={24} />
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">Pure Sportsmanship</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Transparent scoring governed by certified referees and an immutable Point Ledger ensuring verifiable scores and fair competition.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">Holistic Development</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Designed to foster mental resilience, leadership, and lifelong wellness alongside collegiate academic excellence in Birla Knowledge City.
          </p>
        </div>
      </div>

      {/* House System Traditions */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white">
            The Four UMANG Houses
          </h2>
          <p className="text-xs text-stone-500">
            Rooted in Indian excellence and scholarly heritage, each house represents a unique athletic ethos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {houses.map((h) => (
            <div
              key={h.code}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                  style={{ backgroundColor: h.color }}
                >
                  {h.code}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                    {h.name}
                  </h3>
                  <p className="text-xs font-semibold text-stone-500">{h.motto}</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament Scoring Rules */}
      <div className="p-8 sm:p-10 rounded-3xl bg-stone-100 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-6">
        <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <span>Championship Scoring System</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
            <span className="text-2xl font-black text-amber-500 font-mono">10 PTS</span>
            <p className="font-semibold text-xs text-stone-900 dark:text-white">1st Place (Gold Medal)</p>
            <p className="text-[11px] text-stone-500">Winner of match or individual event</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
            <span className="text-2xl font-black text-stone-400 font-mono">7 PTS</span>
            <p className="font-semibold text-xs text-stone-900 dark:text-white">2nd Place (Silver Medal)</p>
            <p className="text-[11px] text-stone-500">Runner-up in finals</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
            <span className="text-2xl font-black text-amber-700 font-mono">5 PTS</span>
            <p className="font-semibold text-xs text-stone-900 dark:text-white">3rd Place (Bronze Medal)</p>
            <p className="text-[11px] text-stone-500">3rd place playoff winner</p>
          </div>
        </div>
        <p className="text-xs text-stone-500 text-center">
          *All house standings update dynamically from validated, official scores recorded in the point ledger.
        </p>
      </div>

      {/* SBU Ranchi Monogram & University Heritage */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <img
            src="/sbu-emblem.png"
            alt="Sarala Birla University Official Emblem"
            className="w-32 h-32 sm:w-44 sm:h-44 drop-shadow-md rounded-full bg-white p-1.5 border-2 border-amber-400/40 object-contain"
          />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary dark:text-amber-400 text-xs font-semibold">
            <span>ESTD. 2017 • BHARAT AROGYA & GYAN MANDIR</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white">
            Sarala Birla University, Ranchi
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
            Established under <span className="font-semibold text-stone-900 dark:text-white">The Sarala Birla University Act, 2017 (Jharkhand Act. No. 13, 2017)</span> by the Legislative Assembly of Jharkhand, SBU is a self-financed private unitary university nestled across nearly 60 acres of verdant landscape at Birla Campus, Vill.- Ara, P.O.- Mahilong, Ranchi-Purulia Highway, Ranchi - 835103. The university aims to provide students not only <em>"education for living and livelihood"</em> but also <em>"education for life"</em>.
          </p>
          <div className="pt-1">
            <span className="text-xs font-serif font-bold text-brand-primary dark:text-amber-400">
              Sanskrit Motto: "ज्ञानं परमं ध्येयम्" (Knowledge is the Supreme Goal)
            </span>
          </div>
        </div>
      </div>

      {/* University Leadership & Sports Incharges Section */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Users size={13} />
            <span>OFFICIAL GOVERNANCE & SPORTS ADMINISTRATION • SBU.AC.IN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 dark:text-white">
            Patrons, Executive Leadership & Sports Incharges
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            Guiding Sarala Birla University toward world-class academic stature, athletic discipline, and sportsmanship.
          </p>
        </div>

        {/* Section 1: Executive Leadership & Patrons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="text-brand-primary dark:text-amber-400" size={18} />
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                University Patrons & Executive Leadership
              </h3>
            </div>
            <span className="text-xs text-stone-500 hidden sm:inline">Apex Administration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {executiveMembers.map((member) => (
              <div
                key={member.id}
                className="group relative p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-amber-400/30 group-hover:border-amber-500 transition-colors shadow-inner flex items-center justify-center">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.monogram-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`monogram-fallback ${
                      member.image_url ? 'hidden' : 'flex'
                    } w-full h-full items-center justify-center font-serif font-bold text-xl text-brand-primary dark:text-amber-400 bg-amber-500/10`}
                  >
                    {getInitials(member.name)}
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm leading-snug line-clamp-2">
                    {member.name}
                  </h4>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {member.designation}
                  </span>
                </div>

                {member.bio && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-4 text-center pt-1">
                    {member.bio}
                  </p>
                )}

                {member.contact_email && (
                  <a
                    href={`mailto:${member.contact_email}`}
                    className="text-[10px] text-stone-400 hover:text-amber-500 transition-colors mt-auto pt-2 block truncate max-w-full font-mono"
                  >
                    {member.contact_email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: University Sports Directorate & All Three Sports Incharges */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="text-amber-500" size={18} />
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                University Sports Directorate & Sports Incharges
              </h3>
            </div>
            <span className="text-xs text-stone-500 hidden sm:inline">Official SBU Sports Committee</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sportsIncharges.map((official) => (
              <div
                key={official.id}
                className="group relative p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3.5"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors shadow-inner flex items-center justify-center">
                  {official.image_url ? (
                    <img
                      src={official.image_url}
                      alt={official.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.monogram-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`monogram-fallback ${
                      official.image_url ? 'hidden' : 'flex'
                    } w-full h-full items-center justify-center font-serif font-bold text-xl text-emerald-700 dark:text-emerald-400 bg-emerald-500/10`}
                  >
                    {getInitials(official.name)}
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm leading-snug">
                    {official.name}
                  </h4>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {official.designation}
                  </span>
                </div>

                {official.bio && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed text-center line-clamp-4 pt-1">
                    {official.bio}
                  </p>
                )}

                {official.contact_email && (
                  <a
                    href={`mailto:${official.contact_email}`}
                    className="text-[10px] text-stone-400 hover:text-emerald-500 transition-colors mt-auto pt-2 block truncate max-w-full font-mono"
                  >
                    {official.contact_email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Sports Mission & Infrastructure */}
      <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-xl space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Department of Art, Culture & Sports</span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Official Athletic Mission
          </h3>
          <blockquote className="text-xs sm:text-sm text-stone-300 italic border-l-2 border-amber-400 pl-4 py-1 leading-relaxed">
            "Our mission is to empower students with the skills and knowledge needed to excel in the dynamic fields of Art, Culture & Sports. We aim to instill ethical values, promote cultural awareness, and cultivate a passion for artistic expression and physical excellence in our students."
          </blockquote>
        </div>

        <div className="pt-4 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">4 AstroTurf Courts</span>
            <span className="text-[10px] text-stone-400">Volleyball Complex</span>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">Full-Size Pitch</span>
            <span className="text-[10px] text-stone-400">Football Arena</span>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">Turf & Nets</span>
            <span className="text-[10px] text-stone-400">Cricket Complex</span>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">Concrete Arena</span>
            <span className="text-[10px] text-stone-400">Basketball Courts</span>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">Multi-Court Hall</span>
            <span className="text-[10px] text-stone-400">Badminton & TT</span>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
            <span className="block font-bold text-xs text-amber-400">400m Track</span>
            <span className="text-[10px] text-stone-400">Athletics Stadium</span>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="text-center pt-4 space-y-3">
        <Link
          to="/sports"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          <span>Explore All Sports Disciplines</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
