import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";
import { PolaroidCard }  from "../../../components/PolaroidCard";

const GALLERY = [
  { n: "Michael B. Jordan", p: 94, c: colors.blue,   r: -3, user: "/samples/user1.jpg", celeb: "/samples/celeb_michael_jordan.jpg" },
  { n: "Lisa – BLACKPINK",  p: 96, c: colors.pink,   r: 4,  user: "/samples/user2.jpg", celeb: "/samples/celeb_lisa.jpg"           },
  { n: "Timothée Chalamet", p: 93, c: colors.purple, r: -2, user: "/samples/user3.jpg", celeb: "/samples/celeb_timothee.jpg"        },
  { n: "Taylor Swift",      p: 97, c: colors.yellow, r: 5,  user: "/samples/user4.jpg", celeb: "/samples/celeb_taylor.jpg"          },
  { n: "Henry Cavill",      p: 91, c: colors.cyan,   r: 3,  user: "/samples/user5.jpg", celeb: "/samples/celeb_henry.jpg"           },
  { n: "Billie Eilish",     p: 89, c: colors.green,  r: -4, user: "/samples/user3.jpg", celeb: "/samples/celeb_billie.jpg"          },
  { n: "Selena Gomez",      p: 92, c: colors.pink,   r: 2,  user: "/samples/user2.jpg", celeb: "/samples/celeb_selena.jpg"          },
  { n: "Harry Styles",      p: 88, c: colors.blue,   r: -5, user: "/samples/user1.jpg", celeb: "/samples/celeb_harry.jpg"           },
];

export function Gallery() {
  return (
    <section id="results" style={{ background: colors.black, padding: "90px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: colors.yellow, textShadow: `3px 3px 0 ${colors.blue}` }}>
            Real Results, Real People
          </h2>
          <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>
            See what our users discovered about their celebrity Doppelganger
          </p>
        </div>
        <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          {GALLERY.map((c, i) => (
            <PolaroidCard key={i} name={c.n} pct={c.p} color={c.c} rotation={c.r} delay={i * 0.2} userImg={c.user} celebImg={c.celeb} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Button size="lg">Find My Doppelganger</Button>
        </div>
      </div>
    </section>
  );
}
