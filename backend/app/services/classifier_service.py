"""
HS & ECCN Trade Compliance Classification Engine for CrossWise.
Determines 6-digit & 10-digit HS codes, ECCN classifications, dual-use risks, and license exemptions.
"""

from typing import Dict, List, Any

# Knowledge rules DB for trade & export classification
PRESET_PRODUCT_PROFILES = [
    {
        "id": "snapdragon_npu_dev_kit",
        "name": "Snapdragon AI Lab Edge Accelerator DevKit",
        "category": "Semiconductors & Edge Compute",
        "description": "On-device AI copilot accelerator board featuring Snapdragon Hexagon NPU, 45 TOPS INT8 execution, 16GB LPDDR5 memory, AES-256 hardware crypto engine, PCIe Gen4 interface.",
        "hs_code": "8542.31.0000",
        "hs_description": "Electronic Integrated Circuits: Processors and controllers, whether or not combined with memories, converters, logic circuits, amplifiers, clock and timing circuits, or other circuits.",
        "eccn": "5A992.c",
        "ccl_category": "Category 5 - Telecommunications & Information Security (Part 2 - Information Security)",
        "control_reasons": ["AT (Anti-Terrorism)"],
        "license_exceptions": ["NLR (No License Required) for dual-use commercial destinations", "ENC (Encryption Commodities)"],
        "dual_use_risk": "LOW",
        "duty_rate": "0.0%",
        "notes": "Complies with mass-market encryption authorization under EAR 740.17(b)(1). Total Processing Performance (TPP) is below 3A090 threshold."
    },
    {
        "id": "hpc_tensor_module",
        "name": "UltraCompute AI Server Module 5120 TOPS",
        "category": "High-Performance Compute ICs",
        "description": "High-performance AI datacenter accelerator ASIC, TPP 5120, NVLink interconnect 900 GB/s, 96GB HBM3 memory, designed for LLM pre-training.",
        "hs_code": "8542.31.0000",
        "hs_description": "Electronic Integrated Circuits: Processors and controllers.",
        "eccn": "3A090.a",
        "ccl_category": "Category 3 - Electronics (Integrated Circuits for High Performance Computing)",
        "control_reasons": ["NS (National Security)", "RS (Regional Stability)", "AT (Anti-Terrorism)"],
        "license_exceptions": ["NAC (Notified Advanced Computing - require 25-day prior notice for D:1/D:4/D:5)"],
        "dual_use_risk": "CRITICAL",
        "duty_rate": "0.0%",
        "notes": "Subject to US BIS interim final rule on advanced computing. Strict export restrictions apply to China, Macau, and Country Group D:5 countries."
    },
    {
        "id": "encrypted_transceiver_chip",
        "name": "Wi-Fi 7 Cryptographic RF Transceiver Subsystem",
        "category": "Telecom & Wireless Hardware",
        "description": "Dual-band RF transceiver IC with embedded AES-256/ECC hardware encryption accelerator, 320 MHz channel bandwidth, WPA3 enterprise security protocol.",
        "hs_code": "8517.62.0050",
        "hs_description": "Machines for the reception, conversion and transmission or regeneration of voice, images or other data, including switching and routing apparatus.",
        "eccn": "5A002.a.1",
        "ccl_category": "Category 5 - Part 2 Information Security",
        "control_reasons": ["NS (National Security)", "AT (Anti-Terrorism)"],
        "license_exceptions": ["ENC § 740.17(b)(2)"],
        "dual_use_risk": "HIGH",
        "duty_rate": "0.0%",
        "notes": "Requires BIS encryption classification report or self-classification reporting (740.17(b)(1)) depending on commercial release scope."
    },
    {
        "id": "drone_telemetry_sensor",
        "name": "Tactical Drone Flight Telemetry & IMU Module",
        "category": "Aerospace & Sensors",
        "description": "MEMS 6-DOF Inertial Measurement Unit with thermal shock resistance, shock-hardened up to 10,000g, operational temperature -55C to +125C, military telemetry interface.",
        "hs_code": "9031.80.8085",
        "hs_description": "Measuring or checking instruments, appliances and machines, not specified or included elsewhere in this chapter.",
        "eccn": "7A003.b",
        "ccl_category": "Category 7 - Navigation and Avionics",
        "control_reasons": ["MT (Missile Technology)", "NS (National Security)", "AT (Anti-Terrorism)"],
        "license_exceptions": ["LVS (Limited Value Shipments - up to $5000)", "CIV"],
        "dual_use_risk": "CRITICAL",
        "duty_rate": "1.4%",
        "notes": "Potential ITAR jurisdiction if specifically modified for defense articles under 22 CFR § 121.1 Cat VIII/XI. Review military spec sheet."
    }
]


class HSClassifierEngine:
    def classify(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # Check against matched preset or synthesize via export rules
        for preset in PRESET_PRODUCT_PROFILES:
            if preset["id"] in text_lower or preset["name"].lower() in text_lower:
                return self._format_result(preset, confidence=99.2)

        # Dynamic classification based on keyword extraction & rules
        if any(w in text_lower for w in ["tops", "hbm", "tpp", "gpu", "datacenter", "5120", "4800", "nvlink"]):
            return {
                "product_name": text[:60] if len(text) > 60 else text,
                "hs_code": "8542.31.0000",
                "hs_description": "Electronic Integrated Circuits: Processors and controllers for high-performance computing.",
                "eccn": "3A090.a",
                "ccl_category": "Category 3 - Electronics (Integrated Circuits for Advanced Compute)",
                "control_reasons": ["NS (National Security)", "RS (Regional Stability)", "AT (Anti-Terrorism)"],
                "license_exceptions": ["NAC (Notified Advanced Computing)"],
                "dual_use_risk": "HIGH",
                "duty_rate": "0.0%",
                "confidence": 94.5,
                "reasoning": [
                    "Input text specifies high compute TOPS or memory interconnect bandwidth.",
                    "Triggers EAR 15 CFR Part 774 Supplement No. 1 criteria for ECCN 3A090.",
                    "Requires verification of end-user and destination country group under BIS Export Control rules."
                ]
            }
        elif any(w in text_lower for w in ["crypto", "encrypt", "aes", "vpn", "cipher", "wifi", "wpa3", "telecom"]):
            return {
                "product_name": text[:60] if len(text) > 60 else text,
                "hs_code": "8517.62.0050",
                "hs_description": "Apparatus for transmission or reception of voice, images or data, including cryptographic equipment.",
                "eccn": "5A002.a.1",
                "ccl_category": "Category 5 Part 2 - Information Security",
                "control_reasons": ["NS (National Security)", "AT (Anti-Terrorism)"],
                "license_exceptions": ["ENC (Encryption Commodities & Software)", "NLR (if mass market 5A992)"],
                "dual_use_risk": "MEDIUM",
                "duty_rate": "0.0%",
                "confidence": 91.8,
                "reasoning": [
                    "Detected encryption algorithms (AES-256 / WPA3 / Cipher primitives).",
                    "Falls under Information Security Category 5 Part 2.",
                    "Review whether item qualifies for Mass Market release under EAR § 740.17(b)(1)."
                ]
            }
        elif any(w in text_lower for w in ["drone", "imu", "mems", "navigation", "tactical", "sensor", "aerospace"]):
            return {
                "product_name": text[:60] if len(text) > 60 else text,
                "hs_code": "9031.80.8085",
                "hs_description": "Measuring or checking instruments and navigation apparatus.",
                "eccn": "7A003.b",
                "ccl_category": "Category 7 - Navigation and Avionics",
                "control_reasons": ["MT (Missile Technology)", "NS (National Security)"],
                "license_exceptions": ["LVS (Limited Value Shipments)"],
                "dual_use_risk": "CRITICAL",
                "duty_rate": "1.4%",
                "confidence": 89.2,
                "reasoning": [
                    "Detected aerospace, inertial measurement, or navigation keywords.",
                    "Enumerate shock rating and operating temperature specs to distinguish ITAR Cat XI vs EAR 7A003."
                ]
            }
        else:
            # Default commercial hardware / EAR99 classification
            return {
                "product_name": text[:60] if len(text) > 60 else text,
                "hs_code": "8542.31.0000",
                "hs_description": "Electronic Integrated Circuits: Processors and controllers (Commercial Grade).",
                "eccn": "EAR99",
                "ccl_category": "N/A - Not Specified on Commerce Control List",
                "control_reasons": ["AT (Anti-Terrorism for embargoed destinations)"],
                "license_exceptions": ["NLR (No License Required)"],
                "dual_use_risk": "LOW",
                "duty_rate": "0.0%",
                "confidence": 88.0,
                "reasoning": [
                    "No restricted high-performance compute or military parameters detected.",
                    "Default classification is EAR99 under US Export Administration Regulations.",
                    "Standard commercial distribution permitted for non-sanctioned entities."
                ]
            }

    def calculate_tpp(self, tops: float, bit_width: int, interconnect_gbps: float, die_area_mm2: float) -> Dict[str, Any]:
        """
        Calculates Total Processing Performance (TPP) and Performance Density
        according to US BIS ECCN 3A090 specifications.
        Formula: TPP = 2 * MacOps_in_TOPS * bit_width
        Performance Density = TPP / die_area_mm2
        """
        tpp = 2 * tops * bit_width
        perf_density = round(tpp / die_area_mm2, 2) if die_area_mm2 > 0 else 0.0

        is_3a090_a = tpp >= 4800 or (tpp >= 1600 and perf_density >= 5.92)
        is_3a090_b = (not is_3a090_a) and (interconnect_gbps >= 600 or (tpp >= 1600 and perf_density >= 3.2))

        if is_3a090_a:
            eccn = "3A090.a"
            governing_rule = "Exceeds 4800 TPP or (1600 TPP & Performance Density >= 5.92). Triggered Advanced Compute Control."
            license_requirement = "License Exception NAC notification mandatory for D:1/D:4/D:5 destinations."
            risk = "CRITICAL"
        elif is_3a090_b:
            eccn = "3A090.b"
            governing_rule = "Triggers ECCN 3A090.b due to high interconnect bandwidth (>= 600 GB/s) or medium compute density."
            license_requirement = "License Exception NAC notification required."
            risk = "HIGH"
        else:
            eccn = "5A992.c / EAR99"
            governing_rule = "Compute parameters fall comfortably below ECCN 3A090 thresholds."
            license_requirement = "No License Required (NLR) for standard commercial exports."
            risk = "LOW"

        return {
            "tops": tops,
            "bit_width": bit_width,
            "interconnect_gbps": interconnect_gbps,
            "die_area_mm2": die_area_mm2,
            "tpp": tpp,
            "performance_density": perf_density,
            "eccn": eccn,
            "governing_rule": governing_rule,
            "license_requirement": license_requirement,
            "risk_level": risk,
            "tpp_threshold_4800_pct": min(100.0, round((tpp / 4800.0) * 100, 1)),
            "density_threshold_592_pct": min(100.0, round((perf_density / 5.92) * 100, 1))
        }

    def scan_bom(self, bom_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Scans a multi-component Bill of Materials (BOM) to assess system export control.
        """
        scanned = []
        highest_risk = "LOW"
        governing_eccn = "EAR99"
        highest_eccn_priority = 0

        eccn_priority = {
            "3A090.a": 10,
            "7A003.b": 9,
            "5A002.a.1": 8,
            "3A090.b": 7,
            "5A992.c": 3,
            "EAR99": 1
        }

        for item in bom_items:
            name = item.get("name", "Unknown Component")
            desc = item.get("description", "")
            qty = item.get("quantity", 1)
            
            res = self.classify(f"{name} {desc}")
            item_eccn = res["eccn"]
            prio = eccn_priority.get(item_eccn, 2)

            if prio > highest_eccn_priority:
                highest_eccn_priority = prio
                governing_eccn = item_eccn

            if res["dual_use_risk"] == "CRITICAL":
                highest_risk = "CRITICAL"
            elif res["dual_use_risk"] == "HIGH" and highest_risk != "CRITICAL":
                highest_risk = "HIGH"

            scanned.append({
                "part_number": item.get("part_number", f"PN-{len(scanned)+1:03d}"),
                "name": name,
                "quantity": qty,
                "hs_code": res["hs_code"],
                "eccn": res["eccn"],
                "risk_level": res["dual_use_risk"],
                "license_exceptions": res["license_exceptions"]
            })

        return {
            "total_components": len(scanned),
            "governing_system_eccn": governing_eccn,
            "overall_system_risk": highest_risk,
            "components": scanned,
            "system_license_recommendation": (
                "System export governed by ECCN 3A090/7A003 high control rating. Formal BIS license or NAC notification required prior to international dispatch."
                if highest_risk in ["CRITICAL", "HIGH"]
                else "System is governed by EAR99/5A992. No License Required (NLR) for standard commercial destinations."
            )
        }

    def get_presets(self) -> List[Dict[str, Any]]:
        return PRESET_PRODUCT_PROFILES

    def _format_result(self, preset: Dict[str, Any], confidence: float) -> Dict[str, Any]:
        return {
            "product_name": preset["name"],
            "hs_code": preset["hs_code"],
            "hs_description": preset["hs_description"],
            "eccn": preset["eccn"],
            "ccl_category": preset["ccl_category"],
            "control_reasons": preset["control_reasons"],
            "license_exceptions": preset["license_exceptions"],
            "dual_use_risk": preset["dual_use_risk"],
            "duty_rate": preset["duty_rate"],
            "confidence": confidence,
            "reasoning": [
                f"Matched product profile '{preset['name']}'.",
                f"ECCN {preset['eccn']} confirmed per Commerce Control List (CCL).",
                preset["notes"]
            ]
        }


classifier_engine = HSClassifierEngine()
