# MVP VRN - Proactive Caregiving App

A real-time, enterprise-grade Caregiving Dashboard built for Care Home Directors and Nurses. This platform centralizes patient vitals, automates family follow-ups via AI, and acts as a single pane of glass for hardware integrations.

**🔴 Live Beta Environment:** [https://mvp-vrn-elderly-care-giving-app.vercel.app](https://mvp-vrn-elderly-care-giving-app.vercel.app)

## 🚀 Key Features

*   **Custom OTP Authentication:** International SMS/Email passwordless login (🇺🇸, 🇬🇧, 🇮🇳, etc.) built natively without heavy third-party auth lock-in.
*   **Real-time Vitals Command Center:** A sleek dark-mode dashboard to monitor patient heart rate, SpO2, and temperature. Includes a complete "Empty State" for SaaS onboarding.
*   **Twilio SMS Integration ("Follow up"):** A fully integrated Twilio backend allowing Caregivers to trigger instant, AI-summarized text messages to a patient's emergency contacts.
*   **Spatial Room View:** A Nurses Station interface mapping physical facility rooms, highlighting critical alerts in red and identifying empty rooms ready for admission.
*   **AI Agent Chat:** A conversational interface for caregivers to instantly generate shift handover reports or query historical vitals.
*   **Family Communications Hub:** A dedicated inbox to monitor automated AI updates and reply to family members directly via SMS.
*   **Looker Studio Integration:** An enterprise analytics tab built to natively embed Google BigQuery Looker Studio reports.
*   **Global Security Standards:** Designed with compliance in mind (HIPAA, SOC 2 Type II, GDPR, ISO 27001).

## 🛠 Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Framer Motion (for fluid, glassmorphic UI)
*   **Communications API:** Twilio (Node.js SDK)
*   **Analytics:** Looker Studio Iframes

## 📦 Local Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables. Create a `.env.local` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. Start the Turbopack development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💼 Business Strategy & Monetization
This application was architected specifically for B2B SaaS sales to Care Home facilities. The UI emphasizes automation (reducing nurse workload) and family communication (increasing facility reputation and client retention).

*Built for global scale.*
