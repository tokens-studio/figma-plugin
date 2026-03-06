import React, { useState } from 'react';
import bannerImage from '@/app/assets/subscription-banner.png';

import { styled } from '@/stitches.config';
import Box from '../Box';

// ─── Styled primitives ───────────────────────────────────────────────

const ContentBox = styled('div', {
    padding: '0 $3 $4',
    display: 'flex',
    flexDirection: 'column',
    gap: '$3',
    overflowY: 'auto',
    flex: 1,
});

// Promo Banner — image-only, full bleed
const PromoBanner = styled('div', {
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
});

const BannerImg = styled('img', {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
});

// ─── Billing segmented control ────────────────────────────────────────

const SegmentedControl = styled('div', {
    display: 'inline-flex',
    border: '1px solid $borderMuted',
    borderRadius: '$medium',
    overflow: 'hidden',
    background: '$bgDefault',
    flexShrink: 0,
});

const SegmentButton = styled('button', {
    padding: '$2 $4',
    fontSize: '$xsmall',
    fontWeight: '$sansBold',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '$fgMuted',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    '&:hover': { color: '$fgDefault' },
    variants: {
        active: {
            true: {
                background: '$bgSubtle',
                color: '$fgDefault',
            },
        },
    },
});

// ─── Plan cards ──────────────────────────────────────────────────────

const PlansGrid = styled('div', {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '$3',
});

const PlanCard = styled('div', {
    border: '1px solid $borderSubtle',
    borderRadius: '12px',
    padding: '$4',
    display: 'flex',
    flexDirection: 'column',
    gap: '$3',
    background: '$bgSubtle',
});

const PlanName = styled('div', {
    fontSize: '$small',
    fontWeight: '$sansBold',
    color: '$fgDefault',
    paddingBottom: '$2',
    marginBottom: '$1',
    borderBottom: '2px solid transparent',
});

const PlanDescription = styled('div', {
    fontSize: '$xsmall',
    color: '$fgMuted',
    lineHeight: 1.5,
    flex: 1,
});

const WhatsIncludedLink = styled('a', {
    fontSize: '$xsmall',
    color: '#5ba4f5',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    '&:hover': { textDecoration: 'underline' },
});

const PriceLine = styled('div', {
    display: 'flex',
    alignItems: 'baseline',
    gap: '$2',
    fontSize: '$xsmall',
    color: '$fgMuted',
    flexWrap: 'wrap',
});

const PriceAmount = styled('span', {
    fontSize: '$medium',
    fontWeight: '$sansBold',
    color: '$fgDefault',
});

const CTAButton = styled('button', {
    width: '100%',
    padding: '$3',
    borderRadius: '$medium',
    fontSize: '$xsmall',
    fontWeight: '$sansBold',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
    '&:hover': { opacity: 0.88 },
    variants: {
        variant: {
            outline: {
                background: 'transparent',
                border: '1px solid $borderMuted',
                color: '$fgDefault',
            },
            pink: {
                background: 'linear-gradient(90deg, #E8409D, #F070B8)',
                color: '#ffffff',
            },
            orange: {
                background: 'linear-gradient(90deg, #E8632A 0%, #F5A623 100%)',
                color: '#ffffff',
            },
            purple: {
                background: '#7B5FF5',
                color: '#ffffff',
            },
        },
    },
});

const FooterNote = styled('div', {
    fontSize: '$xxsmall',
    color: '$fgMuted',
    textAlign: 'center',
    lineHeight: 1.5,
    padding: '0 $2',
});

const FooterLink = styled('a', {
    color: '#5ba4f5',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
});

// ─── Plan Data ───────────────────────────────────────────────────────

type BillingCycle = 'yearly' | 'monthly';

interface PlanConfig {
    name: string;
    underlineColor: string;
    description: string;
    yearlyPrice: string | null;
    monthlyPrice: string | null;
    yearlyNote: string;
    monthlyNote: string;
    ctaLabel: string;
    ctaVariant: 'outline' | 'pink' | 'orange' | 'purple';
    ctaHref: string;
}

const PLANS: PlanConfig[] = [
    {
        name: 'Starter',
        underlineColor: '#7DDE3B',
        description:
            'Create a free Starter account to unlock exports, import Figma variables, and manage unlimited tokens and sets with ease.',
        yearlyPrice: null,
        monthlyPrice: null,
        yearlyNote: 'No billing details required',
        monthlyNote: 'No billing details required',
        ctaLabel: 'Create an Account',
        ctaVariant: 'outline',
        ctaHref: 'https://tokens.studio/signup',
    },
    {
        name: 'Starter Plus',
        underlineColor: '#E8409D',
        description:
            'Designed for advanced users who want full control – unlock all plugin features and build smarter, faster, and at scale.',
        yearlyPrice: '€39',
        monthlyPrice: '€49',
        yearlyNote: 'per month, billed annually',
        monthlyNote: 'per month',
        ctaLabel: 'Try for Free 30 days',
        ctaVariant: 'pink',
        ctaHref: 'https://tokens.studio/signup?plan=starter-plus',
    },
    {
        name: 'Essential',
        underlineColor: '#E8632A',
        description:
            'Get full access to the Studio platform – sync, manage, and deliver tokens at scale. Built for professional solo builders.',
        yearlyPrice: '€169',
        monthlyPrice: '€199',
        yearlyNote: 'No billing details required',
        monthlyNote: 'per month',
        ctaLabel: 'Try for Free 30 days',
        ctaVariant: 'orange',
        ctaHref: 'https://tokens.studio/signup?plan=essential',
    },
    {
        name: 'Organization',
        underlineColor: '#7B5FF5',
        description:
            'Scale your design system with the full Studio platform – manage teams, projects, and collaboration at any level.',
        yearlyPrice: '€499',
        monthlyPrice: '€599',
        yearlyNote: 'No billing details required',
        monthlyNote: 'per month',
        ctaLabel: 'Try for Free 30 days',
        ctaVariant: 'purple',
        ctaHref: 'https://tokens.studio/signup?plan=organization',
    },
];

// ─── Component ───────────────────────────────────────────────────────

export default function SubscriptionPlans() {
    const [billing, setBilling] = useState<BillingCycle>('yearly');

    return (
        <ContentBox>
            {/* Banner */}
            <PromoBanner>
                <BannerImg src={bannerImage} alt="Unlock Endless Possibilities" />
            </PromoBanner>

            {/* Plans & Upgrades heading + segmented billing toggle */}
            <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box css={{ fontSize: '$small', fontWeight: '$sansBold', color: '$fgDefault' }}>
                    Plans &amp; Upgrades
                </Box>
                <SegmentedControl>
                    <SegmentButton
                        type="button"
                        active={billing === 'yearly'}
                        onClick={() => setBilling('yearly')}
                    >
                        Yearly (20% off)
                    </SegmentButton>
                    <SegmentButton
                        type="button"
                        active={billing === 'monthly'}
                        onClick={() => setBilling('monthly')}
                    >
                        Monthly
                    </SegmentButton>
                </SegmentedControl>
            </Box>

            {/* Plan cards */}
            <PlansGrid>
                {PLANS.map((plan) => {
                    const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                    const note = billing === 'yearly' ? plan.yearlyNote : plan.monthlyNote;
                    return (
                        <PlanCard key={plan.name}>
                            <PlanName css={{ borderBottomColor: plan.underlineColor }}>
                                {plan.name}
                            </PlanName>
                            <PlanDescription>{plan.description}</PlanDescription>
                            <WhatsIncludedLink href={plan.ctaHref} target="_blank" rel="noreferrer">
                                What's included &rsaquo;
                            </WhatsIncludedLink>
                            <PriceLine>
                                {price ? (
                                    <>
                                        <PriceAmount>{price}</PriceAmount>
                                        <span>{note}</span>
                                    </>
                                ) : (
                                    <>
                                        <PriceAmount>Free</PriceAmount>
                                        <span>{note}</span>
                                    </>
                                )}
                            </PriceLine>
                            <CTAButton
                                type="button"
                                variant={plan.ctaVariant}
                                onClick={() => window.open(plan.ctaHref, '_blank')}
                            >
                                {plan.ctaLabel}
                            </CTAButton>
                        </PlanCard>
                    );
                })}
            </PlansGrid>

            {/* Footer */}
            <FooterNote>
                More info about pricing and plan details you can find on{' '}
                <FooterLink href="https://www.tokens.studio/pricing" target="_blank" rel="noreferrer">
                    www.tokens.studio/pricing
                </FooterLink>
            </FooterNote>
        </ContentBox>
    );
}
