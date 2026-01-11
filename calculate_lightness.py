
import colorsys

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def calculate_diff(name, start_hex, end_hex):
    r1, g1, b1 = hex_to_rgb(start_hex)
    r2, g2, b2 = hex_to_rgb(end_hex)
    
    # RGB to HLS (Hue, Lightness, Saturation)
    # colorsys.rgb_to_hls expects values 0-1
    h1, l1, s1 = colorsys.rgb_to_hls(r1/255.0, g1/255.0, b1/255.0)
    h2, l2, s2 = colorsys.rgb_to_hls(r2/255.0, g2/255.0, b2/255.0)
    
    # Calculate % increase/decrease
    diff_pct = ((l2 - l1) / l1) * 100
    
    print(f"{name}:")
    print(f"  Start: {start_hex} (L={l1*100:.1f}%)")
    print(f"  End:   {end_hex} (L={l2*100:.1f}%)")
    print(f"  Delta: {('+' if diff_pct > 0 else '')}{diff_pct:.1f}% Lightness")
    print("-" * 20)

pairs = [
    ("Indigo", "#3F4786", "#5A62C8"),
    ("Green",  "#189c77", "#36c79b"),
    ("Red",    "#d33b36", "#ef6261"),
    ("Blue",   "#2472c1", "#479dec")
]

print("Lightness Calculation Results:\n")
for name, s, e in pairs:
    calculate_diff(name, s, e)
