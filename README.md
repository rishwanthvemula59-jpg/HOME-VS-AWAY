# PitchEdge 🏏
> **"Is home advantage real, or just noise? Test it, ground by ground."**

🚀 **Live Production Deployment:** [https://pitchedge-ten.vercel.app](https://pitchedge-ten.vercel.app)

PitchEdge is an interactive statistics and sports analytics product that runs live **Welch's two-sample $t$-tests** on simulated IPL innings-scoring data to test the **Home Advantage Hypothesis** across India's 10 premier cricket grounds.

Built for **Module VII (Testing of Hypothesis)**, PitchEdge is engineered and polished to the standard of a production-grade sports analytics SaaS tool.

---

## 🌟 Key Features

- **Live Welch's Two-Sample $t$-Test**: Calculates exact test statistics and Welch–Satterthwaite degrees of freedom without assuming equal variances ($\sigma^2_{\text{home}} \ne \sigma^2_{\text{away}}$).
- **Exact $p$-Value Calculation**: Mathematical implementation of the Regularized Incomplete Beta Function $I_x(a, b)$ using continued fractions (modified Lentz's method) and Lanczos log-gamma series.
- **Dynamic Rejection-Region Visualizer**: Custom SVG rendering of the theoretical Student's $t$ probability density function $f(t; df)$ that re-plots and changes shape dynamically as degrees of freedom shift, complete with shaded $p$-value tail area, $t_{\text{critical}}(\alpha = 0.05)$ threshold, and observed $t_{\text{stat}}$ marker.
- **Mirrored Population Pyramid**: Physics-eased, staggered animated dot-plot displaying 15 home scores stacked upward vs 15 away scores stacked downward per stadium.
- **Pooled League Histogram**: Bidirectional mirrored frequency distribution aggregating all 300 league innings.
- **Sortable League Leaderboard**: 10-card franchise grid sortable by $p$-value, mean scoring difference, $t$-score, or true ground effect, with visual $p$-value bars.
- **Contextual Franchise Risk Matrix**: Translates Type I (false positive) and Type II (false negative) statistical errors into concrete IPL franchise economic stakes (mega-auction budget allocation, toss strategies, pitch curation).
- **Day Match / Night Match Theming**: Bespoke color palettes inspired by sunlit afternoon cricket turf and floodlit stadium night fixtures.
- **10 Original Franchise Badges**: Geometric SVG vector crests designed in team color identities without copyrighted logos.

---

## 📐 Statistical Specifications

### 1. Hypotheses (Right-Tailed Test)
- **Null Hypothesis ($H_0$):** $\mu_{\text{home}} \le \mu_{\text{away}}$ (No positive home scoring advantage)
- **Alternative Hypothesis ($H_a$):** $\mu_{\text{home}} > \mu_{\text{away}}$ (True positive home advantage)
- **Significance Level:** $\alpha = 0.05$

### 2. Welch's $t$-Statistic
$$t = \frac{\bar{x}_{\text{home}} - \bar{x}_{\text{away}}}{\sqrt{\frac{s^2_{\text{home}}}{n_{\text{home}}} + \frac{s^2_{\text{away}}}{n_{\text{away}}}}}$$

### 3. Welch–Satterthwaite Degrees of Freedom ($df$)
$$df = \frac{\left( \frac{s^2_{\text{home}}}{n_{\text{home}}} + \frac{s^2_{\text{away}}}{n_{\text{away}}} \right)^2}{\frac{\left(\frac{s^2_{\text{home}}}{n_{\text{home}}}\right)^2}{n_{\text{home}} - 1} + \frac{\left(\frac{s^2_{\text{away}}}{n_{\text{away}}}\right)^2}{n_{\text{away}} - 1}}$$

### 4. Decision Rule
Reject $H_0$ if $t_{\text{observed}} > t_{\text{critical}}(\alpha=0.05, df)$ or equivalently if $p < 0.05$.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone or navigate into the project directory
cd "HOME VS AWAY"

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your web browser.

### Verify Math Engine
To run the automated verification script testing the statistical engine against reference values ($df=28, t=2.05 \implies p=0.02495$; $df=10, t=1.8125 \implies p=0.050$):
```bash
npx tsx src/lib/verify_math.ts
```

---

## 📊 Swapping in a Real Ball-by-Ball Dataset

PitchEdge is designed with strict separation between data generation and the statistical engine (`src/lib/statsEngine.ts`). Swapping in historical IPL ball-by-ball records (e.g. from Cricsheet, Kaggle, or ESPNcricinfo) requires **zero modifications to the core statistical engine**.

### Expected Input Schema
| Column | Type | Description | Example |
|---|---|---|---|
| `franchise` | String | Host franchise name | `Royal Challengers Bengaluru` |
| `venue` | String | Stadium name | `M. Chinnaswamy Stadium` |
| `location` | String | City, State | `Bengaluru, Karnataka` |
| `batting_team_type` | String | `'home'` or `'away'` | `'home'` |
| `runs_scored` | Integer | Total innings runs | `194` |

To ingest your dataset, load the innings arrays into `runWelchTTest(homeScores, awayScores)` in `src/lib/statsEngine.ts`.

---

## 🛠️ Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (custom CSS tokens & Day/Night match palettes)
- **Motion**: Framer Motion
- **Icons**: Lucide React
- **Engine**: Pure TypeScript numerical computation (Box-Muller sampler, Lentz continued fractions, Lanczos log-gamma)
