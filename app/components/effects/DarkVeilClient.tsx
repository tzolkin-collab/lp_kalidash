"use client";
import dynamic from "next/dynamic";

type Props = {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
};

const DarkVeil = dynamic(() => import("./DarkVeil"), { ssr: false });

export default function DarkVeilClient(props: Props) {
  return <DarkVeil {...props} />;
}
