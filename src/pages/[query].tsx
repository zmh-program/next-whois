import { lookupWhoisWithCache } from "@/lib/whois/lookup";
import {
  cleanDomainQuery,
  cn,
  getWindowHref,
  toReadableISODate,
  toSearchURI,
  useClipboard,
} from "@/lib/utils";
import { NextPageContext } from "next";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  RiCameraLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiLinkM,
  RiBarChartBoxAiFill,
  RiShareLine,
  RiShieldLine,
  RiQuestionFill,
  RiShieldKeyholeLine,
  RiLinkUnlink,
  RiTwitterXLine,
  RiFacebookFill,
  RiRedditLine,
  RiWhatsappLine,
  RiTelegramLine,
  RiArrowLeftSLine,
  RiLinksLine,
  RiTimeLine,
  RiExchangeDollarFill,
  RiBillLine,
} from "@remixicon/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React, { useEffect, useMemo } from "react";
import { addHistory, detectQueryType } from "@/lib/history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhoisAnalyzeResult, WhoisResult } from "@/lib/whois/types";
import Icon from "@/components/icon";
import { useImageCapture } from "@/lib/image";
import ErrorArea from "@/components/items/error-area";
import RichTextarea from "@/components/items/rich-textarea";
import InfoText from "@/components/items/info-text";
import Clickable from "@/components/motion/clickable";
import { SearchBox } from "@/components/search_box";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

type Props = {
  data: WhoisResult;
  target: string;
  isCapture?: boolean;
};

export async function getServerSideProps(context: NextPageContext) {
  const { query } = context;
  const target: string = cleanDomainQuery(query);

  return {
    props: {
      data: await lookupWhoisWithCache(target),
      target,
    },
  };
}

type ResultTableProps = {
  result?: WhoisAnalyzeResult;
  target: string;
};

function getDnssecIcon(dnssec?: string) {
  if (!dnssec) {
    return <RiShieldKeyholeLine />;
  }
  const key = dnssec.toLowerCase();

  switch (key) {
    case "unsigned":
      return <RiQuestionFill />;
    case "signed":
      return <RiShieldLine />;
    default:
      return <RiShieldKeyholeLine />;
  }
}

function ResultTable({ result, target }: ResultTableProps) {
  const { t } = useTranslation();
  const Row = ({
    name,
    value,
    children,
    hidden,
    badge,
    likeLink,
  }: {
    name: string;
    value: any;
    hidden?: boolean;
    children?: React.ReactNode;
    likeLink?: boolean;
    badge?: React.ReactNode;
  }) =>
    !hidden && (
      <tr>
        <td
          className={`py-1 pr-2 text-right font-medium text-secondary whitespace-pre-wrap md:w-36`}
        >
          {name}
        </td>
        <td
          className={cn(
            `py-1 pl-2 text-left text-primary whitespace-pre-wrap break-all flex items-center`,
            likeLink && `cursor-pointer hover:underline`,
          )}
          onClick={() => {
            if (likeLink) {
              window.open(
                value.startsWith("http") ? value : `http://${value}`,
                "_blank",
                "noopener,noreferrer",
              );
            }
          }}
        >
          {value}
          {children}
          {badge}
        </td>
      </tr>
    );

  const StatusComp = () => {
    if (!result || result.status.length === 0) {
      return "N/A";
    }

    const status = useMemo(() => {
      const length = result.status.length;
      if (length > 3 && !expand) {
        return [
          ...result.status.slice(0, 3),
          {
            status: `...${length - 3} more`,
            url: "expand",
          },
        ];
      }

      return result.status;
    }, [result.status]);

    return (
      <div className={`inline-flex flex-row items-center flex-wrap`}>
        {status.map((status, index) => (
          <Link
            href={status.url}
            key={index}
            target={`_blank`}
            className={`inline-flex group flex-row whitespace-nowrap flex-nowrap items-center m-0.5 cursor-pointer px-1.5 py-0.5 border rounded text-xs`}
            onClick={(e) => {
              if (status.url === "expand") {
                e.preventDefault();
                setExpand(!expand);
              } else if (!status.url) {
                e.preventDefault();
              }
            }}
          >
            {status.url !== "expand" && (
              <Icon
                icon={status.url ? <RiLinkM /> : <RiLinkUnlink />}
                className={`w-3 h-3 mr-1 shrink-0 text-muted-foreground transition group-hover:text-primary`}
              />
            )}
            {status.status}
          </Link>
        ))}
      </div>
    );
  };

  const [expand, setExpand] = React.useState<boolean>(false);
  const copy = useClipboard();

  return (
    result && (
      <table className={`w-full text-sm mb-4 whitespace-pre-wrap`}>
        <tbody>
          <Row
            name={t("whois_fields.name")}
            value={result.domain || target.toUpperCase()}
            badge={
              result.remainingDays !== null &&
              result.remainingDays <= 60 && (
                <Badge
                  className="ml-1.5 py-0.25 px-1.5 rounded border-dashed font-normal"
                  variant="outline"
                >
                  {t("expiring_soon")}
                </Badge>
              )
            }
          />
          <Row name={t("whois_fields.status")} value={<StatusComp />} />
          <Row
            name={t("whois_fields.registrar")}
            value={result.registrar}
            hidden={!result.registrar || result.registrar === "Unknown"}
          />
          <Row
            name={t("whois_fields.registrar_url")}
            value={result.registrarURL}
            likeLink
            hidden={!result.registrarURL || result.registrarURL === "Unknown"}
          />
          <Row
            name={t("whois_fields.iana_id")}
            value={result.ianaId}
            hidden={!result.ianaId || result.ianaId === "N/A"}
          >
            <Link
              className={`inline-flex ml-1`}
              href={`https://www.internic.net/registrars/registrar-${result.ianaId ?? 0}.html`}
              target={`_blank`}
            >
              <Button variant={`ghost`} size={`icon-xs`}>
                <RiExternalLinkLine className={`w-3 h-3`} />
              </Button>
            </Link>
          </Row>

          {/* IP Whois Only */}
          <Row
            name={t("whois_fields.cidr")}
            value={result.cidr}
            hidden={!result.cidr || result.cidr === "Unknown"}
          />
          <Row
            name={t("whois_fields.net_type")}
            value={result.netType}
            hidden={!result.netType || result.netType === "Unknown"}
          />
          <Row
            name={t("whois_fields.net_name")}
            value={result.netName}
            hidden={!result.netName || result.netName === "Unknown"}
          />
          <Row
            name={t("whois_fields.inet_num")}
            value={result.inetNum}
            hidden={!result.inetNum || result.inetNum === "Unknown"}
          />
          <Row
            name={t("whois_fields.inet6_num")}
            value={result.inet6Num}
            hidden={!result.inet6Num || result.inet6Num === "Unknown"}
          />
          <Row
            name={t("whois_fields.net_range")}
            value={result.netRange}
            hidden={!result.netRange || result.netRange === "Unknown"}
          />
          <Row
            name={t("whois_fields.origin_as")}
            value={result.originAS}
            hidden={!result.originAS || result.originAS === "Unknown"}
          />
          {/* IP Whois Only End */}

          <Row
            name={t("whois_fields.whois_server")}
            value={result.whoisServer}
            likeLink
            hidden={!result.whoisServer || result.whoisServer === "Unknown"}
          />
          <Row
            name={t("whois_fields.creation_date")}
            value={toReadableISODate(result.creationDate)}
            hidden={!result.creationDate || result.creationDate === "Unknown"}
          >
            <InfoText content={t("utc")} />
          </Row>
          <Row
            name={t("whois_fields.updated_date")}
            value={toReadableISODate(result.updatedDate)}
            hidden={!result.updatedDate || result.updatedDate === "Unknown"}
          >
            <InfoText content={t("utc")} />
          </Row>
          <Row
            name={t("whois_fields.expiration_date")}
            value={toReadableISODate(result.expirationDate)}
            hidden={
              !result.expirationDate || result.expirationDate === "Unknown"
            }
          >
            <InfoText content={t("utc")} />
          </Row>
          <Row
            name={t("whois_fields.registrant_organization")}
            value={result.registrantOrganization}
            hidden={
              !result.registrantOrganization ||
              result.registrantOrganization === "Unknown"
            }
          />
          <Row
            name={t("whois_fields.registrant_province")}
            value={result.registrantProvince}
            hidden={
              !result.registrantProvince ||
              result.registrantProvince === "Unknown"
            }
          />
          <Row
            name={t("whois_fields.registrant_country")}
            value={result.registrantCountry}
            hidden={
              !result.registrantCountry ||
              result.registrantCountry === "Unknown"
            }
          />
          <Row
            name={t("whois_fields.registrant_phone")}
            value={result.registrantPhone}
            hidden={
              !result.registrantPhone || result.registrantPhone === "Unknown"
            }
          >
            <InfoText content={t("abuse")} />
          </Row>
          <Row
            name={t("whois_fields.registrant_email")}
            value={result.registrantEmail}
            hidden={
              !result.registrantEmail || result.registrantEmail === "Unknown"
            }
          />
          <Row
            name={t("whois_fields.name_servers")}
            value={
              <div className={`flex flex-col`}>
                {result.nameServers.map((ns, index) => (
                  <div
                    key={index}
                    className={`text-secondary hover:text-primary transition duration-500 text-xs border cursor-pointer rounded-md px-1 py-0.5 mt-0.5 w-fit inline-flex flex-row items-center`}
                    onClick={() => copy(ns)}
                  >
                    <RiFileCopyLine className={`w-2.5 h-2.5 mr-1`} />
                    {ns}
                  </div>
                ))}
              </div>
            }
            hidden={result.nameServers.length === 0}
          />
          <Row
            name={t("whois_fields.dnssec")}
            value={result.dnssec}
            hidden={!result.dnssec}
          >
            <Icon
              className={`inline w-3.5 h-3.5 ml-1.5`}
              icon={getDnssecIcon(result.dnssec)}
            />
          </Row>
        </tbody>
      </table>
    )
  );
}

const ResultComp = React.forwardRef<HTMLDivElement, Props>(
  ({ data, target, isCapture }: Props, ref) => {
    const { t } = useTranslation();
    const copy = useClipboard();

    const captureObject = React.useRef<HTMLDivElement>(null);
    const capture = useImageCapture(captureObject);

    const { status, result, error, time } = data;

    const current = getWindowHref();

    return (
      <div
        className={cn(
          "w-full h-fit mt-2",
          isCapture &&
            "flex flex-col items-center m-0 p-4 w-full bg-background",
        )}
      >
        {!isCapture && (
          <div
            className={`inline-flex flex-row items-center w-full h-fit select-none mb-1 space-x-2`}
          >
            {result && result?.domainAge !== null && (
              <div className="flex items-center space-x-1.5">
                <div className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1">
                  <RiTimeLine className="w-3 h-3 text-muted-foreground shrink-0 hidden sm:block" />
                  <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">
                    {result.domainAge === 0 ? "<1" : result.domainAge}{" "}
                    {t("years")}
                  </span>
                </div>
              </div>
            )}

            {result?.registerPrice && (
              <Link
                target="_blank"
                href={result.registerPrice.externalLink}
                className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1 cursor-pointer hover:border-muted-foreground/50 transition-colors duration-300"
              >
                <RiBillLine className="w-3 h-3 text-muted-foreground shrink-0 hidden sm:block" />
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-normal text-muted-foreground break-words",
                    result.registerPrice.isPremium && "text-red-500",
                  )}
                >
                  {t("register_price")}
                  {result.registerPrice.new}{" "}
                  {result.registerPrice.currency.toUpperCase()}
                </span>
              </Link>
            )}

            {result?.renewPrice && (
              <Link
                href={result.renewPrice.externalLink}
                target="_blank"
                className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1 cursor-pointer hover:border-muted-foreground/50 transition-colors duration-300"
              >
                <RiExchangeDollarFill className="w-3 h-3 text-muted-foreground shrink-0 hidden sm:block" />
                <span
                  className={
                    "text-[11px] sm:text-xs font-normal text-muted-foreground break-words"
                  }
                >
                  {t("renew_price")}
                  {result.renewPrice.renew}{" "}
                  {result.renewPrice.currency.toUpperCase()}
                </span>
              </Link>
            )}

            <div className={`flex-grow`} />
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant={`outline`}
                  size={`icon-sm`}
                  className={`transition duration-500 hover:border-muted-foreground shadow-sm`}
                  tapEnabled
                >
                  <RiCameraLine className={`w-4 h-4 stroke-[1.5]`} />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle
                    className={`inline-flex items-center justify-center`}
                  >
                    <RiCameraLine className={`w-5 h-5 stroke-[1.5] mr-1.5`} />
                    {t("capture")}
                  </DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <div className={`my-2`}>
                  <ResultComp
                    data={data}
                    target={target}
                    ref={captureObject}
                    isCapture={true}
                  />
                </div>
                <DrawerFooter>
                  <Button
                    variant={`outline`}
                    onClick={() => capture(`whois-${target}`)}
                    className={`flex flex-row items-center w-full max-w-[568px] mx-auto`}
                    tapEnabled
                  >
                    <RiCameraLine className={`w-4 h-4 mr-2`} />
                    {t("capture")}
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant={`outline`}
                  size={`icon-sm`}
                  className={`transition duration-500 hover:border-muted-foreground shadow-sm`}
                  tapEnabled
                >
                  <RiShareLine className={`w-4 h-4 stroke-[1.5]`} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className={`w-full text-center`}>
                <DrawerHeader>
                  <DrawerTitle
                    className={`inline-flex items-center justify-center`}
                  >
                    <RiShareLine className={`w-4 h-4 stroke-[1.5] mr-1.5`} />
                    {t("share")}
                  </DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <DrawerDescription>
                  <p className={`text-sm text-secondary`}>
                    {t("share_description")}
                  </p>
                </DrawerDescription>

                <div
                  className={`flex flex-row items-center w-full max-w-[468px] mx-auto mt-4 justify-center space-x-2`}
                >
                  {/* twitter */}
                  <Link
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Whois Lookup Result: ${target} - ${status ? "Success" : "Failed"}`,
                    )}&url=${encodeURIComponent(current)}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <RiTwitterXLine className={`w-4 h-4`} />
                    </Button>
                  </Link>

                  {/*  facebook */}
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <RiFacebookFill className={`w-4 h-4`} />
                    </Button>
                  </Link>

                  {/*  reddit */}
                  <Link
                    href={`https://reddit.com/submit?url=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <RiRedditLine className={`w-4 h-4`} />
                    </Button>
                  </Link>

                  {/*  whatsapp */}
                  <Link
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <RiWhatsappLine className={`w-4 h-4`} />
                    </Button>
                  </Link>

                  {/*  telegram */}
                  <Link
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      current,
                    )}`}
                    target={`_blank`}
                  >
                    <Button size={`icon-sm`} variant={`outline`} tapEnabled>
                      <RiTelegramLine className={`w-4 h-4`} />
                    </Button>
                  </Link>
                </div>
                <DrawerFooter>
                  <div
                    className={`flex flex-row items-center w-full max-w-[468px] mx-auto`}
                  >
                    <Input
                      className={`flex-grow border-r-0 rounded-r-none text-center`}
                      value={current}
                      readOnly
                    />
                    <Button
                      size={`icon`}
                      variant={`secondary`}
                      onClick={() => copy(current)}
                      className={`rounded-l-none`}
                      tapEnabled
                    >
                      <RiFileCopyLine className={`w-4 h-4`} />
                    </Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        )}
        <Card
          ref={ref}
          className={cn(isCapture ? "w-full max-w-[568px]" : "shadow")}
        >
          <CardHeader>
            <CardTitle
              className={`flex flex-row items-center text-sm md:text-base`}
            >
              <div
                onClick={() => copy(target)}
                className={cn(
                  `inline-flex w-fit max-w-32 sm:max-w-64 flex-row items-center space-x-1 cursor-pointer select-none`,
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 shrink-0 rounded-full mr-1",
                    status ? "bg-green-500" : "bg-red-500",
                  )}
                />

                <p
                  className={cn(
                    `grow`,
                    !isCapture && `text-ellipsis overflow-hidden`,
                    isCapture && `text-ellipsis overflow-hidden`,
                  )}
                >
                  {target}
                </p>
              </div>
              <div className={`flex-grow`} />
              <Badge className="mr-1">{detectQueryType(target)}</Badge>
              <Badge variant={`outline`} className="border-dashed">
                {time.toFixed(2)}s
              </Badge>
            </CardTitle>
            <CardContent className={`w-full p-0`}>
              {!status ? (
                <ErrorArea error={error} />
              ) : (
                <div className={`flex flex-col h-fit w-full mt-2`}>
                  <ResultTable result={result} target={target} />

                  {!isCapture && (
                    <>
                      {result?.rawRdapContent && (
                        <RichTextarea
                          className={`mt-2`}
                          name={t("raw_rdap_response")}
                          value={result.rawRdapContent}
                          saveFileName={`${target.replace(/\./g, "-")}-rdap.json`}
                        />
                      )}
                      {result?.rawWhoisContent && (
                        <RichTextarea
                          className={`mt-2`}
                          name={t("raw_whois_response")}
                          value={result.rawWhoisContent}
                          saveFileName={`${target.replace(/\./g, "-")}-whois.txt`}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </CardHeader>
        </Card>
        {!isCapture && result && result.mozDomainAuthority !== -1 && (
          <div className="mt-3 w-full">
            <Card className="shadow-sm border bg-muted/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium flex items-center space-x-2 w-full">
                  <RiBarChartBoxAiFill className="w-4 h-4" />
                  <span>{t("whois_fields.moz_stats")}</span>
                  <Link
                    href="https://moz.com/learn/seo/domain-authority"
                    target="_blank"
                    className="p-0.5 text-muted-foreground hover:text-primary transition-colors duration-300 !ml-auto flex-shrink-0"
                  >
                    <RiExternalLinkLine className="w-3.5 h-3.5" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={cn(
                      "flex flex-col items-center rounded-lg p-3 bg-background border",
                      result.mozDomainAuthority > 50 &&
                        "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                    )}
                  >
                    <span className="text-xs text-muted-foreground mb-1">
                      Domain Authority
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        result.mozDomainAuthority > 50
                          ? "text-green-600 dark:text-green-400"
                          : "text-secondary",
                      )}
                    >
                      {result.mozDomainAuthority}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex flex-col items-center rounded-lg p-3 bg-background border",
                      result.mozPageAuthority > 50 &&
                        "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                    )}
                  >
                    <span className="text-xs text-muted-foreground mb-1">
                      Page Authority
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        result.mozPageAuthority > 50
                          ? "text-green-600 dark:text-green-400"
                          : "text-secondary",
                      )}
                    >
                      {result.mozPageAuthority}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex flex-col items-center rounded-lg p-3 bg-background border",
                      result.mozSpamScore > 5 &&
                        "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                    )}
                  >
                    <span className="text-xs text-muted-foreground mb-1">
                      Spam Score
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        result.mozSpamScore > 5
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400",
                      )}
                    >
                      {result.mozSpamScore}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  },
);

export default function Lookup({ data, target }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSearch = (query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  };

  useEffect(() => {
    if (data.status) {
      addHistory(target);
    }
  }, []);

  return (
    <ScrollArea className="w-full h-[calc(100vh-4rem)]">
      <main
        className={
          "relative w-full min-h-[calc(100vh-4rem)] grid place-items-center px-4 pb-6"
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={
            "flex flex-col items-center w-full h-fit max-w-[568px] m-2 mt-4"
          }
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="w-full flex items-center justify-start"
          >
            <Link href="/">
              <button className="flex items-center text-secondary hover:text-primary transition-colors text-xs duration-300">
                <RiArrowLeftSLine className="w-4 h-4 mr-1" />
                {t("back")}
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className={"w-full mt-1.5"}
          >
            <SearchBox
              initialValue={target}
              onSearch={handleSearch}
              loading={loading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <ResultComp data={data} target={target} />
          </motion.div>
        </motion.div>
      </main>
    </ScrollArea>
  );
}
