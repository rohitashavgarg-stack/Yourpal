/* eslint-disable react-hooks/set-state-in-effect -- the effect resets local state when its input changes, as designed */
import React, { useEffect, useRef, useState } from 'react';
import { RoundBtn } from '@/components/bits';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { fadeOut } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Phone, WifiOff } from '@/lib/icons';
import { ProgLogo } from '@/features/shell/parts';
import { setShell, switchProgramme, useShell } from '@/features/shell/state';
import { Button, Card, Field, Pressy, Row, Txt } from '@/components/ui';
import { LOGO_BLUE, YourPalLogo } from '@/components/YourPalLogo';
import { OtpInput } from '@/components/OtpInput';
import { useOverlay } from '@/components/Overlay';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { INDIA, isValidNumber, Country } from '@/lib/countries';
import { CountrySheet } from '@/features/shell/CountrySheet';
import { Callout } from '@/design-system/primitives/Callout';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { openLegal } from '@/features/legal/links';

type Step = 'phone' | 'otp' | 'join' | 'programme';

export default function Login() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, set, setSc } = useStore();
  const { toast, openSheet } = useOverlay();
  const sc = state.sc;
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(state.phone || '');
  const [country, setCountry] = useState<Country>(INDIA);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<'none' | 'notFound' | 'offline' | 'invalid'>('none');
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<'idle' | 'error' | 'ok' | 'locked'>('idle');
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState(0);
  const [resendIn, setResendIn] = useState(30);
  const [lockIn, setLockIn] = useState(0);
  const [reading, setReading] = useState(false);
  const { s: shell, progs, multi } = useShell();
  // Past the join code step (a code accepted, or "I don't have one"): choose where to start, or go straight in.
  const afterJoin = () => { if (multi && shell.sc.pick === 'Shown') setStep('programme'); else finish(); };
  const [joinCode, setJoinCode] = useState('');
  // Why a code was turned down (null: nothing wrong). Sample codes: GOLD21 works, OLD19 has expired, USED77 is already used.
  const [joinBad, setJoinBad] = useState<string | null>(null);
  const tryJoin = () => {
    const code = joinCode.trim().toUpperCase();
    const why = code === 'GOLD21' ? null
      : code === 'OLD19' ? 'This code has expired. Ask the front desk for a new one.'
      : code === 'USED77' ? 'This code has already been used. Ask the front desk for a new one.'
      : 'We could not find this code. Check it and try again.';
    if (why) { setJoinBad(why); haptic.error(); return; }
    haptic.success();
    toast("Code accepted. You're joining Wulf Fitness");
    afterJoin();
  };
  const finish = (id?: string) => {
    if (id) { const n = switchProgramme(id); if (n) haptic.success(); }
    set({ loggedIn: true, phone });
    router.replace(state.onboarded ? '/(tabs)' : '/onboarding');
  };

  useScenarios({
    title: 'Log in',
    rows: [
      { label: 'Phone number', options: ['In CRM', 'Not found'], value: sc.number, onPick: (v) => { setSc({ number: v as any }); setErr('none'); } },
      { label: 'Code entered', options: ['Correct', 'Wrong'], value: sc.otp, onPick: (v) => { setSc({ otp: v as any }); setCodeState('idle'); setTries(0); setLockIn(0); } },
      { label: 'Android SMS auto-read', options: ['Off', 'On'], value: sc.autoRead, onPick: (v) => setSc({ autoRead: v as any }) },
      { label: 'Connection', options: ['Online', 'Offline'], value: sc.net, onPick: (v) => { setSc({ net: v as any }); setErr('none'); } },
      { label: 'Programmes on this number', options: ['Three', 'Only one'], value: shell.sc.progs, onPick: (v) => setShell((s) => ({ sc: { ...s.sc, progs: v as any } })) },
    ],
    actions: [
      { label: 'Fill a valid number', run: () => setPhone('9876543210') },
      { label: 'Jump to code step', run: () => { setPhone('9876543210'); setStep('otp'); } },
    ],
  }, [sc.number, sc.otp, sc.autoRead, sc.net, shell.sc.progs]);

  // resend + lock timers
  useEffect(() => {
    if (step !== 'otp') return;
    const t = setInterval(() => { setResendIn((v) => Math.max(0, v - 1)); setLockIn((v) => Math.max(0, v - 1)); }, 1000);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => { if (codeState === 'locked' && lockIn === 0) { setCodeState('idle'); setTries(0); setCode(''); } }, [lockIn]);

  // Android SMS auto-read simulation
  useEffect(() => {
    if (step !== 'otp' || sc.autoRead !== 'On') return;
    setReading(true);
    const digits = '482913';
    let i = 0;
    const t0 = setTimeout(() => {
      const t = setInterval(() => { i++; setCode(digits.slice(0, i)); if (i >= 6) { clearInterval(t); setReading(false); } }, 90);
    }, 1100);
    return () => clearTimeout(t0);
  }, [step, sc.autoRead]);

  // verify when 6 digits
  useEffect(() => {
    if (code.length < 6 || codeState === 'ok' || codeState === 'locked') return;
    if (sc.net === 'Offline') { setErr('offline'); haptic.error(); return; }
    const t = setTimeout(() => {
      if (sc.otp === 'Correct') {
        setCodeState('ok'); haptic.success();
        // Several programmes on this number: let the member choose where to start. One: go straight in.
        setTimeout(() => setStep('join'), 650);
      } else {
        const n = tries + 1; setTries(n); haptic.error(); setShake((k) => k + 1);
        if (n >= 3) { setCodeState('locked'); setLockIn(59); }
        else { setCodeState('error'); setTimeout(() => { setCode(''); setCodeState('idle'); }, 700); }
      }
    }, 350);
    return () => clearTimeout(t);
  }, [code]);

  const valid = isValidNumber(country, phone);
  const send = () => {
    if (!valid) { setErr('invalid'); haptic.error(); return; }
    if (sc.net === 'Offline') { setErr('offline'); haptic.error(); return; }
    setBusy(true); setErr('none');
    setTimeout(() => {
      setBusy(false);
      if (sc.number === 'Not found') { setErr('notFound'); haptic.error(); return; }
      setCode(''); setCodeState('idle'); setTries(0); setResendIn(30); setStep('otp');
    }, 700);
  };

  const masked = phone ? `${country.code} ${phone.slice(0, 2)}xxx x${phone.slice(-4)}` : '';
  const pickCountry = () => openSheet(<CountrySheet value={country} onPick={(k) => { setCountry(k); setPhone((p) => p.slice(0, k.max)); setErr('none'); }} />, { label: 'Country code' });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: insets.bottom + 24, flexGrow: 1, gap: 16 }} keyboardShouldPersistTaps="handled">
        {step === 'otp' || step === 'join' || step === 'programme' ? (
          <RoundBtn label="Back to phone number" onPress={() => { setStep('phone'); setErr('none'); setCode(''); setCodeState('idle'); }} glass>
            <ChevronLeft size={22} color={c.ink} />
          </RoundBtn>
        ) : (
          <RoundBtn label="Back" onPress={() => { set({ loggedIn: false }); if (router.canGoBack()) router.back(); else router.replace('/welcome'); }} glass>
            <ChevronLeft size={22} color={c.ink} />
          </RoundBtn>
        )}

        {step === 'phone' && (
          <FadeIn key="phone" exiting={fadeOut()} style={{ gap: 16, flexGrow: 1 }}>
            <YourPalLogo height={34} color={isDark ? fixed.white : LOGO_BLUE} />

            <View style={{ gap: 6, marginTop: 12 }}>
              <Txt v="title">Log in with your phone</Txt>
              <Txt muted>Use the number you gave your gym. We&apos;ll text you a code.</Txt>
            </View>
            <Field
              prefix={country.code}
              onPrefixPress={pickCountry}
              prefixLabel={`Country code ${country.code}, ${country.name}. Change`}
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, country.max)); if (err !== 'none') setErr('none'); }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              placeholder="98765 43210"
              accessibilityLabel="Phone number"
              error={err === 'invalid' || err === 'notFound'}
              returnKeyType="done"
              onSubmitEditing={send}
            />
            {err === 'invalid' && <FadeIn><Txt v="caption" color={c.warn}>{country.min === country.max ? `Enter a ${country.max}-digit mobile number.` : `Enter your mobile number.`}</Txt></FadeIn>}
            {err === 'notFound' && (
              <FadeIn>
                <Callout tone="warn" size="lg" gap={10}>
                  <Txt v="headline" color={c.warn}>We couldn&apos;t find this number</Txt>
                  <Txt color={c.warn} style={{ fontSize: fontSizes.md }}>Please check with your gym&apos;s front desk. They can add it to your membership in a minute.</Txt>
                  <Row style={{ gap: 8 }}>
                    <Button small kind="primary" label="Call front desk" icon={<Phone size={16} color={c.bg} />} onPress={() => toast('Calling Wulf Fitness front desk…')} />
                    <Button small kind="secondary" label="Try another number" onPress={() => { setPhone(''); setErr('none'); }} />
                  </Row>
                </Callout>
              </FadeIn>
            )}
            {err === 'offline' && <OfflineBanner />}
            <View style={{ flexGrow: 1 }} />
            <Button label={busy ? 'Sending code…' : 'Send code'} onPress={send} disabled={busy || phone.length < country.min} />
            <Txt v="caption" style={{ textAlign: 'center' }}>
              By continuing you agree to the{' '}
              <Txt v="caption" accessibilityRole="link" onPress={() => openLegal('terms', () => toast('Could not open the page. Try again in a moment'))} style={{ fontFamily: font.semibold, color: c.accentText }}>Terms</Txt>
              {' '}and{' '}
              <Txt v="caption" accessibilityRole="link" onPress={() => openLegal('privacy', () => toast('Could not open the page. Try again in a moment'))} style={{ fontFamily: font.semibold, color: c.accentText }}>Privacy Policy</Txt>.
            </Txt>
          </FadeIn>
        )}

        {step === 'otp' && (
          <FadeIn key="otp" style={{ gap: 18, flexGrow: 1 }}>
            <View style={{ gap: 6 }}>
              <Txt v="title">Enter the 6-digit code</Txt>
              <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                <Txt muted>Sent to {masked}</Txt>
                <Pressable accessibilityRole="button" onPress={() => setStep('phone')}><Txt style={{ fontFamily: font.semibold, color: c.accentText }}>Change</Txt></Pressable>
              </Row>
            </View>
            <FadeIn>
              <Row style={{ gap: 12, padding: 12, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}>
                {progs.length > 1 ? (
                  <View style={{ flexDirection: 'row', paddingRight: 14 }}>
                    {progs.map((p, i) => <View key={p.id} style={{ marginRight: -14, zIndex: 10 - i, borderRadius: radii.lg, borderWidth: 2, borderColor: c.surface }}><ProgLogo p={p} size={36} /></View>)}
                  </View>
                ) : <ProgLogo p={progs[0]} size={40} />}
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{progs.length > 1 ? `Found you in ${progs.length} programmes` : progs[0].name.split(' · ')[0]}</Txt>
                  <Txt v="caption">{progs.length > 1 ? progs.map((p) => p.short).join(' · ') : progs[0].name.includes(' · ') ? progs[0].name.split(' · ')[1] : progs[0].kind}</Txt>
                </View>
              </Row>
            </FadeIn>
            <OtpInput value={code} onChange={(v) => { setCode(v); if (err === 'offline') setErr('none'); }} state={codeState} shakeKey={shake} autoFocus={sc.autoRead !== 'On'} />
            {reading && <FadeIn><Txt v="label" color={c.accentText}>Reading the code from SMS…</Txt></FadeIn>}
            {codeState === 'error' && <FadeIn><Txt v="label" color={c.warn}>That code didn&apos;t match. {3 - tries} {3 - tries === 1 ? 'try' : 'tries'} left.</Txt></FadeIn>}
            {codeState === 'locked' && (
              <FadeIn>
                <Callout tone="warn" size="sm">
                  <Txt color={c.warn} style={{ fontFamily: font.semibold }}>Too many wrong tries</Txt>
                  <Txt color={c.warn} style={{ fontSize: fontSizes.md }}>For your safety, try again in 0:{String(lockIn).padStart(2, '0')}, or ask the front desk.</Txt>
                </Callout>
              </FadeIn>
            )}
            {codeState === 'ok' && <FadeIn><Txt v="label" color={c.good}>Verified · setting things up</Txt></FadeIn>}
            {err === 'offline' && <OfflineBanner />}
            <View style={{ flexGrow: 1 }} />
            <Button kind="secondary" label={resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'} disabled={resendIn > 0 || codeState === 'locked'} onPress={() => { setResendIn(30); setCode(''); setCodeState('idle'); toast('New code sent to ' + masked); }} />
            <Txt v="caption" style={{ textAlign: 'center' }}>Tip: any 6 digits work in this prototype. Use the edge-case panel to test a wrong code.</Txt>
          </FadeIn>
        )}
        {step === 'join' && (
          <FadeIn key="join" style={{ gap: 18, flexGrow: 1 }}>
            <View style={{ gap: 6 }}>
              <Txt v="title">Do you have a join code?</Txt>
              <Txt muted>Your gym shares a code on WhatsApp or at the front desk. You can skip this and join later.</Txt>
            </View>
            <Field value={joinCode} onChangeText={(t) => { setJoinCode(t.toUpperCase()); setJoinBad(null); }} autoCapitalize="characters" placeholder="e.g. GOLD21" accessibilityLabel="Join code" error={!!joinBad} autoFocus returnKeyType="done" onSubmitEditing={tryJoin} />
            {joinBad && <FadeIn><Txt accessibilityRole="alert" v="label" color={c.warn}>{joinBad}</Txt></FadeIn>}
            <View style={{ flexGrow: 1 }} />
            <Button label="Join gym" onPress={tryJoin} disabled={joinCode.length < 4} />
            <Pressy accessibilityRole="button" onPress={afterJoin} style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>I don’t have a code</Txt>
            </Pressy>
          </FadeIn>
        )}
        {step === 'programme' && (
          <FadeIn key="programme" style={{ gap: 14, flexGrow: 1 }}>
            <View style={{ gap: 6 }}>
              <Txt v="title">Where do you want to start?</Txt>
              <Txt muted>Your number is part of {progs.length} programmes. Pick one now. You can switch any time from the name at the top of Today.</Txt>
            </View>
            {progs.map((p, i) => (
              <FadeIn key={p.id} delay={i * 60}>
                <Pressy accessibilityRole="button" accessibilityLabel={`Start with ${p.name}`} onPress={() => finish(p.id)} scaleTo={0.98}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radii.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}>
                  <ProgLogo p={p} size={48} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{p.name.split(' · ')[0]}</Txt>
                    <Txt v="caption">{p.kind}{p.name.includes(' · ') ? ' · ' + p.name.split(' · ')[1] : ''}{p.unread ? ` · ${p.unread} new` : ''}</Txt>
                  </View>
                  <ChevronRight size={18} color={c.muted} />
                </Pressy>
              </FadeIn>
            ))}
            <View style={{ flexGrow: 1 }} />
            <Txt v="caption" style={{ textAlign: 'center' }}>Each programme keeps its own plan, progress and data.</Txt>
          </FadeIn>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OfflineBanner() {
  const { c } = useTheme();
  return (
    <FadeIn>
      <Row style={{ gap: 10, padding: 14, borderRadius: radii.md, backgroundColor: c.surface2 }}>
        <WifiOff size={18} color={c.muted} />
        <Txt style={{ flex: 1, fontSize: fontSizes.md }} muted>No internet connection. Check Wi-Fi or data and try again.</Txt>
      </Row>
    </FadeIn>
  );
}
