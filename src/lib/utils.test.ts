import { describe, it, expect } from "vitest";
import { cleanDomain, extractDomain } from "@/lib/utils";

describe("extractDomain", () => {
  // --- basic domains ---
  it("simple domain", () => {
    expect(extractDomain("example.com")).toBe("example.com");
  });

  it("subdomain", () => {
    expect(extractDomain("www.example.com")).toBe("example.com");
  });

  it("deep subdomain", () => {
    expect(extractDomain("a.b.c.example.com")).toBe("example.com");
  });

  it("hyphenated domain", () => {
    expect(extractDomain("my-example.com")).toBe("my-example.com");
  });

  it("numeric subdomain", () => {
    expect(extractDomain("123.example.com")).toBe("example.com");
  });

  // --- generic TLDs ---
  it(".net", () => {
    expect(extractDomain("example.net")).toBe("example.net");
  });

  it(".org", () => {
    expect(extractDomain("example.org")).toBe("example.org");
  });

  it(".info", () => {
    expect(extractDomain("example.info")).toBe("example.info");
  });

  it(".biz", () => {
    expect(extractDomain("example.biz")).toBe("example.biz");
  });

  // --- new gTLDs ---
  it(".dev", () => {
    expect(extractDomain("example.dev")).toBe("example.dev");
  });

  it(".io", () => {
    expect(extractDomain("example.io")).toBe("example.io");
  });

  it(".app", () => {
    expect(extractDomain("example.app")).toBe("example.app");
  });

  it(".ai", () => {
    expect(extractDomain("example.ai")).toBe("example.ai");
  });

  it(".technology", () => {
    expect(extractDomain("example.technology")).toBe("example.technology");
  });

  it(".xyz", () => {
    expect(extractDomain("example.xyz")).toBe("example.xyz");
  });

  it(".cloud", () => {
    expect(extractDomain("example.cloud")).toBe("example.cloud");
  });

  // --- ccTLDs ---
  it(".cc", () => {
    expect(extractDomain("example.cc")).toBe("example.cc");
  });

  it(".tv", () => {
    expect(extractDomain("example.tv")).toBe("example.tv");
  });

  it(".me", () => {
    expect(extractDomain("example.me")).toBe("example.me");
  });

  it(".co", () => {
    expect(extractDomain("example.co")).toBe("example.co");
  });

  it(".cn", () => {
    expect(extractDomain("example.cn")).toBe("example.cn");
  });

  it(".de", () => {
    expect(extractDomain("example.de")).toBe("example.de");
  });

  it(".jp (direct)", () => {
    expect(extractDomain("example.jp")).toBe("example.jp");
  });

  it(".ru", () => {
    expect(extractDomain("example.ru")).toBe("example.ru");
  });

  it(".fr", () => {
    expect(extractDomain("example.fr")).toBe("example.fr");
  });

  it(".kr (direct)", () => {
    expect(extractDomain("example.kr")).toBe("example.kr");
  });

  // --- two-level public suffixes ---
  it(".co.uk", () => {
    expect(extractDomain("example.co.uk")).toBe("example.co.uk");
  });

  it(".ac.uk", () => {
    expect(extractDomain("example.ac.uk")).toBe("example.ac.uk");
  });

  it(".gov.uk", () => {
    expect(extractDomain("example.gov.uk")).toBe("example.gov.uk");
  });

  it(".com.au", () => {
    expect(extractDomain("example.com.au")).toBe("example.com.au");
  });

  it(".net.au", () => {
    expect(extractDomain("example.net.au")).toBe("example.net.au");
  });

  it(".com.br", () => {
    expect(extractDomain("example.com.br")).toBe("example.com.br");
  });

  it(".com.cn", () => {
    expect(extractDomain("example.com.cn")).toBe("example.com.cn");
  });

  it(".org.cn", () => {
    expect(extractDomain("example.org.cn")).toBe("example.org.cn");
  });

  it(".ac.cn", () => {
    expect(extractDomain("example.ac.cn")).toBe("example.ac.cn");
  });

  it(".edu.cn", () => {
    expect(extractDomain("example.edu.cn")).toBe("example.edu.cn");
  });

  it(".co.jp", () => {
    expect(extractDomain("example.co.jp")).toBe("example.co.jp");
  });

  it(".ne.jp", () => {
    expect(extractDomain("example.ne.jp")).toBe("example.ne.jp");
  });

  it(".ac.jp", () => {
    expect(extractDomain("example.ac.jp")).toBe("example.ac.jp");
  });

  it(".or.jp", () => {
    expect(extractDomain("example.or.jp")).toBe("example.or.jp");
  });

  it(".co.kr", () => {
    expect(extractDomain("example.co.kr")).toBe("example.co.kr");
  });

  it(".com.hk", () => {
    expect(extractDomain("example.com.hk")).toBe("example.com.hk");
  });

  it(".net.hk", () => {
    expect(extractDomain("example.net.hk")).toBe("example.net.hk");
  });

  it(".org.hk", () => {
    expect(extractDomain("example.org.hk")).toBe("example.org.hk");
  });

  it(".co.hk (NOT in PSL, tldts returns co.hk)", () => {
    expect(extractDomain("example.co.hk")).toBe("co.hk");
  });

  it(".com.tw", () => {
    expect(extractDomain("example.com.tw")).toBe("example.com.tw");
  });

  it(".com.sg", () => {
    expect(extractDomain("example.com.sg")).toBe("example.com.sg");
  });

  it(".com.my", () => {
    expect(extractDomain("example.com.my")).toBe("example.com.my");
  });

  it(".co.in", () => {
    expect(extractDomain("example.co.in")).toBe("example.co.in");
  });

  it(".co.id", () => {
    expect(extractDomain("example.co.id")).toBe("example.co.id");
  });

  it(".co.za", () => {
    expect(extractDomain("example.co.za")).toBe("example.co.za");
  });

  it(".co.nz", () => {
    expect(extractDomain("example.co.nz")).toBe("example.co.nz");
  });

  it(".co.th", () => {
    expect(extractDomain("example.co.th")).toBe("example.co.th");
  });

  it(".co.il", () => {
    expect(extractDomain("example.co.il")).toBe("example.co.il");
  });

  it(".com.ar", () => {
    expect(extractDomain("example.com.ar")).toBe("example.com.ar");
  });

  it(".com.mx", () => {
    expect(extractDomain("example.com.mx")).toBe("example.com.mx");
  });

  it(".com.tr", () => {
    expect(extractDomain("example.com.tr")).toBe("example.com.tr");
  });

  it(".com.vn", () => {
    expect(extractDomain("example.com.vn")).toBe("example.com.vn");
  });

  it(".com.pk", () => {
    expect(extractDomain("example.com.pk")).toBe("example.com.pk");
  });

  it(".com.ng", () => {
    expect(extractDomain("example.com.ng")).toBe("example.com.ng");
  });

  it(".co.ke", () => {
    expect(extractDomain("example.co.ke")).toBe("example.co.ke");
  });

  it(".ac (direct)", () => {
    expect(extractDomain("example.ac")).toBe("example.ac");
  });

  it(".com.ac", () => {
    expect(extractDomain("example.com.ac")).toBe("example.com.ac");
  });

  it(".co.ac (NOT in PSL, tldts returns co.ac)", () => {
    expect(extractDomain("example.co.ac")).toBe("co.ac");
  });

  it(".sh", () => {
    expect(extractDomain("example.sh")).toBe("example.sh");
  });

  it(".tm", () => {
    expect(extractDomain("example.tm")).toBe("example.tm");
  });

  // --- subdomain with two-level TLD ---
  it("subdomain + .co.uk", () => {
    expect(extractDomain("www.example.co.uk")).toBe("example.co.uk");
  });

  it("subdomain + .com.au", () => {
    expect(extractDomain("mail.example.com.au")).toBe("example.com.au");
  });

  it("subdomain + .co.jp", () => {
    expect(extractDomain("www.example.co.jp")).toBe("example.co.jp");
  });

  // --- URLs ---
  it("http URL", () => {
    expect(extractDomain("http://example.com")).toBe("example.com");
  });

  it("https URL", () => {
    expect(extractDomain("https://example.com")).toBe("example.com");
  });

  it("URL with path", () => {
    expect(extractDomain("https://example.com/path/to/page")).toBe(
      "example.com",
    );
  });

  it("URL with port", () => {
    expect(extractDomain("https://example.com:8080")).toBe("example.com");
  });

  it("URL with query string", () => {
    expect(extractDomain("https://example.com?q=test")).toBe("example.com");
  });

  it("URL with fragment", () => {
    expect(extractDomain("https://example.com#section")).toBe("example.com");
  });

  it("URL with query and fragment", () => {
    expect(extractDomain("https://example.com?q=1#top")).toBe("example.com");
  });

  it("URL with subdomain and path", () => {
    expect(extractDomain("https://www.example.com/path")).toBe("example.com");
  });

  it("URL with auth", () => {
    expect(extractDomain("https://user:pass@example.com")).toBe("example.com");
  });

  it("URL with trailing slash", () => {
    expect(extractDomain("https://example.com/")).toBe("example.com");
  });

  it("uppercase URL", () => {
    expect(extractDomain("HTTPS://EXAMPLE.COM")).toBe("example.com");
  });

  it("mixed case URL", () => {
    expect(extractDomain("https://Www.Example.Com")).toBe("example.com");
  });

  // --- non-domains ---
  it("plain IP returns null", () => {
    expect(extractDomain("192.168.1.1")).toBeNull();
  });

  it("CIDR returns null", () => {
    expect(extractDomain("192.168.1.0/24")).toBeNull();
  });

  it("ASN returns null", () => {
    expect(extractDomain("AS13335")).toBeNull();
  });

  it("bare TLD returns null", () => {
    expect(extractDomain("com")).toBeNull();
  });

  it("empty string returns null", () => {
    expect(extractDomain("")).toBeNull();
  });

  it("localhost returns null", () => {
    expect(extractDomain("localhost")).toBeNull();
  });

  it("IPv6 returns null", () => {
    expect(extractDomain("2001:db8::1")).toBeNull();
  });
});

describe("cleanDomain", () => {
  // --- basic domains ---
  it("simple domain", () => {
    expect(cleanDomain("example.com")).toBe("example.com");
  });

  it("strips subdomain", () => {
    expect(cleanDomain("www.example.com")).toBe("example.com");
  });

  it("strips deep subdomain", () => {
    expect(cleanDomain("a.b.c.example.com")).toBe("example.com");
  });

  it("hyphenated domain", () => {
    expect(cleanDomain("my-example.com")).toBe("my-example.com");
  });

  // --- generic TLDs ---
  it(".net", () => {
    expect(cleanDomain("example.net")).toBe("example.net");
  });

  it(".org", () => {
    expect(cleanDomain("example.org")).toBe("example.org");
  });

  // --- new gTLDs ---
  it(".dev", () => {
    expect(cleanDomain("example.dev")).toBe("example.dev");
  });

  it(".io", () => {
    expect(cleanDomain("example.io")).toBe("example.io");
  });

  it(".ai", () => {
    expect(cleanDomain("example.ai")).toBe("example.ai");
  });

  it(".app", () => {
    expect(cleanDomain("example.app")).toBe("example.app");
  });

  it(".xyz", () => {
    expect(cleanDomain("example.xyz")).toBe("example.xyz");
  });

  // --- ccTLDs ---
  it(".cc", () => {
    expect(cleanDomain("example.cc")).toBe("example.cc");
  });

  it(".tv", () => {
    expect(cleanDomain("example.tv")).toBe("example.tv");
  });

  it(".me", () => {
    expect(cleanDomain("example.me")).toBe("example.me");
  });

  it(".co", () => {
    expect(cleanDomain("example.co")).toBe("example.co");
  });

  // --- two-level public suffixes ---
  it(".co.uk", () => {
    expect(cleanDomain("example.co.uk")).toBe("example.co.uk");
  });

  it(".ac.uk", () => {
    expect(cleanDomain("example.ac.uk")).toBe("example.ac.uk");
  });

  it(".com.au", () => {
    expect(cleanDomain("example.com.au")).toBe("example.com.au");
  });

  it(".net.au", () => {
    expect(cleanDomain("example.net.au")).toBe("example.net.au");
  });

  it(".com.br", () => {
    expect(cleanDomain("example.com.br")).toBe("example.com.br");
  });

  it(".com.cn", () => {
    expect(cleanDomain("example.com.cn")).toBe("example.com.cn");
  });

  it(".org.cn", () => {
    expect(cleanDomain("example.org.cn")).toBe("example.org.cn");
  });

  it(".ac.cn", () => {
    expect(cleanDomain("example.ac.cn")).toBe("example.ac.cn");
  });

  it(".co.jp", () => {
    expect(cleanDomain("example.co.jp")).toBe("example.co.jp");
  });

  it(".or.jp", () => {
    expect(cleanDomain("example.or.jp")).toBe("example.or.jp");
  });

  it(".co.kr", () => {
    expect(cleanDomain("example.co.kr")).toBe("example.co.kr");
  });

  it(".com.hk", () => {
    expect(cleanDomain("example.com.hk")).toBe("example.com.hk");
  });

  it(".co.hk (NOT in PSL, tldts returns co.hk)", () => {
    expect(cleanDomain("example.co.hk")).toBe("co.hk");
  });

  it(".com.tw", () => {
    expect(cleanDomain("example.com.tw")).toBe("example.com.tw");
  });

  it(".com.sg", () => {
    expect(cleanDomain("example.com.sg")).toBe("example.com.sg");
  });

  it(".co.in", () => {
    expect(cleanDomain("example.co.in")).toBe("example.co.in");
  });

  it(".co.za", () => {
    expect(cleanDomain("example.co.za")).toBe("example.co.za");
  });

  it(".co.nz", () => {
    expect(cleanDomain("example.co.nz")).toBe("example.co.nz");
  });

  it(".co.th", () => {
    expect(cleanDomain("example.co.th")).toBe("example.co.th");
  });

  it(".co.il", () => {
    expect(cleanDomain("example.co.il")).toBe("example.co.il");
  });

  it(".com.ar", () => {
    expect(cleanDomain("example.com.ar")).toBe("example.com.ar");
  });

  it(".com.mx", () => {
    expect(cleanDomain("example.com.mx")).toBe("example.com.mx");
  });

  it(".com.tr", () => {
    expect(cleanDomain("example.com.tr")).toBe("example.com.tr");
  });

  it(".com.vn", () => {
    expect(cleanDomain("example.com.vn")).toBe("example.com.vn");
  });

  it(".ac (direct)", () => {
    expect(cleanDomain("example.ac")).toBe("example.ac");
  });

  it(".com.ac", () => {
    expect(cleanDomain("example.com.ac")).toBe("example.com.ac");
  });

  it(".co.ac (NOT in PSL, tldts returns co.ac)", () => {
    expect(cleanDomain("example.co.ac")).toBe("co.ac");
  });

  // --- subdomain + two-level TLD ---
  it("subdomain + .co.uk", () => {
    expect(cleanDomain("www.example.co.uk")).toBe("example.co.uk");
  });

  it("subdomain + .com.au", () => {
    expect(cleanDomain("mail.example.com.au")).toBe("example.com.au");
  });

  it("subdomain + .co.jp", () => {
    expect(cleanDomain("www.example.co.jp")).toBe("example.co.jp");
  });

  // --- URLs ---
  it("http URL", () => {
    expect(cleanDomain("http://example.com")).toBe("example.com");
  });

  it("https URL", () => {
    expect(cleanDomain("https://example.com")).toBe("example.com");
  });

  it("URL with path", () => {
    expect(cleanDomain("https://example.com/path/to")).toBe("example.com");
  });

  it("URL with port", () => {
    expect(cleanDomain("https://example.com:8080/path")).toBe("example.com");
  });

  it("URL with subdomain", () => {
    expect(cleanDomain("https://www.example.com")).toBe("example.com");
  });

  it("URL with query", () => {
    expect(cleanDomain("https://example.com?q=1")).toBe("example.com");
  });

  it("URL with fragment", () => {
    expect(cleanDomain("https://example.com#section")).toBe("example.com");
  });

  it("URL with query and fragment", () => {
    expect(cleanDomain("https://example.com?q=1#top")).toBe("example.com");
  });

  it("URL with auth", () => {
    expect(cleanDomain("https://user:pass@example.com/path")).toBe(
      "example.com",
    );
  });

  it("URL with trailing slash", () => {
    expect(cleanDomain("https://example.com/")).toBe("example.com");
  });

  it("uppercase URL", () => {
    expect(cleanDomain("HTTP://EXAMPLE.COM")).toBe("example.com");
  });

  it("mixed case URL", () => {
    expect(cleanDomain("https://Www.Example.Com/Path")).toBe("example.com");
  });

  // --- IPs ---
  it("plain IPv4", () => {
    expect(cleanDomain("192.168.1.1")).toBe("192.168.1.1");
  });

  it("IPv4 with http", () => {
    expect(cleanDomain("http://192.168.1.1")).toBe("192.168.1.1");
  });

  it("IPv4 with https and port", () => {
    expect(cleanDomain("https://192.168.1.1:8080")).toBe("192.168.1.1");
  });

  it("IPv4 with path", () => {
    expect(cleanDomain("http://10.0.0.1/admin")).toBe("10.0.0.1");
  });

  it("public IP 8.8.8.8", () => {
    expect(cleanDomain("8.8.8.8")).toBe("8.8.8.8");
  });

  it("public IP 1.1.1.1", () => {
    expect(cleanDomain("1.1.1.1")).toBe("1.1.1.1");
  });

  it("loopback 127.0.0.1", () => {
    expect(cleanDomain("127.0.0.1")).toBe("127.0.0.1");
  });

  it("private 10.0.0.1", () => {
    expect(cleanDomain("10.0.0.1")).toBe("10.0.0.1");
  });

  it("private 172.16.0.1", () => {
    expect(cleanDomain("172.16.0.1")).toBe("172.16.0.1");
  });

  it("broadcast 255.255.255.255", () => {
    expect(cleanDomain("255.255.255.255")).toBe("255.255.255.255");
  });

  // --- CIDR ---
  it("CIDR /0", () => {
    expect(cleanDomain("0.0.0.0/0")).toBe("0.0.0.0/0");
  });

  it("CIDR /8", () => {
    expect(cleanDomain("10.0.0.0/8")).toBe("10.0.0.0/8");
  });

  it("CIDR /16", () => {
    expect(cleanDomain("172.16.0.0/16")).toBe("172.16.0.0/16");
  });

  it("CIDR /24", () => {
    expect(cleanDomain("192.168.1.0/24")).toBe("192.168.1.0/24");
  });

  it("CIDR /32", () => {
    expect(cleanDomain("1.2.3.4/32")).toBe("1.2.3.4/32");
  });

  // --- IPv6 CIDR ---
  it("IPv6 CIDR /12", () => {
    expect(cleanDomain("2001:db8::1/12")).toBe("2001:db8::1/12");
  });

  it("IPv6 CIDR /48", () => {
    expect(cleanDomain("2001:db8::/48")).toBe("2001:db8::/48");
  });

  it("IPv6 CIDR /128", () => {
    expect(cleanDomain("::1/128")).toBe("::1/128");
  });

  // --- ASN ---
  it("ASN uppercase", () => {
    expect(cleanDomain("AS13335")).toBe("AS13335");
  });

  it("ASN lowercase", () => {
    expect(cleanDomain("as13335")).toBe("as13335");
  });

  it("ASN large number", () => {
    expect(cleanDomain("AS400644")).toBe("AS400644");
  });

  // --- edge cases ---
  it("empty string", () => {
    expect(cleanDomain("")).toBe("");
  });

  it("bare TLD", () => {
    expect(cleanDomain("com")).toBe("com");
  });

  it("incomplete IP", () => {
    expect(cleanDomain("192.168")).toBe("192.168");
  });

  it("random string", () => {
    expect(cleanDomain("hello")).toBe("hello");
  });

  it("localhost", () => {
    expect(cleanDomain("localhost")).toBe("localhost");
  });

  it("domain with trailing dot", () => {
    expect(cleanDomain("example.com.")).toBe("example.com");
  });

  it("email-like input", () => {
    expect(cleanDomain("user@example.com")).toBe("example.com");
  });

  it("spaces around domain", () => {
    expect(cleanDomain("  example.com  ").trim()).toBe("example.com");
  });
});
