import { beforeEach, expect, jest, test, describe } from "@jest/globals";
const { ENConversion } = require("../src/index");
const { pageJsons } = require("./pageJsons");

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  delete window.ENConversion_Convert;
  delete window.ENConversion_DontConvert;
});

describe("it does a conversion", () => {
  test("if this is the last page and previous page was of the same campaign", () => {
    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });

  test("when redirected to a single page", () => {
    new ENConversion(pageJsons.singlePageWithRedirect)
    const pageJson = pageJsons.singlePage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });

  test("when redirected to the last page of a campaign", () => {
    new ENConversion(pageJsons.singlePageWithRedirect)
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });

  test("when redirected to a static page", () => {
    new ENConversion(pageJsons.singlePageWithRedirect)
    const pageJson = pageJsons.staticPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });

  test("where it usually would not, if the ENConversion_Convert global is set", () => {
    window.ENConversion_Convert = true;
    const pageJson = pageJsons.firstPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });

  test("for multiple campaigns completed in the same session", () => {
    const firstPageJson = pageJsons.firstPage
    new ENConversion(firstPageJson);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    let conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");

    firstPageJson.campaignId = "12345";
    pageJson.campaignId = "12345";
    new ENConversion(firstPageJson);
    new ENConversion(pageJson);

    conversion = sessionStorage.getItem("ENConversion_Converted_12345");

    expect(conversion).toBe("true");
  });

  test("for the same campaign being completed multiple times in the same session", () => {
    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    let conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");

    sessionStorage.clear();

    new ENConversion(pageJsons.firstPage);
    new ENConversion(pageJson);

    conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBe("true");
  });
});

describe("it does NOT do a conversion", () => {
  test("if this is not the last page", () => {
    const pageJson = pageJsons.firstPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBeNull();
  });

  test("on a single page without being redirected to it (a landing page)", () => {
    const pageJson = pageJsons.singlePage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBeNull();
  });

  test("when redirected to a page that is not a single page, or the last page.", () => {
    new ENConversion(pageJsons.singlePageWithRedirect)
    const pageJson = pageJsons.middlePage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBeNull();
  });

  test("when a page where a conversion has happened is refreshed", () => {
    const spy = jest.spyOn(ENConversion.prototype, "convert");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);
    new ENConversion(pageJson);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("where it usually would, if the ENConversion_DontConvert global is set", () => {
    window.ENConversion_DontConvert = true;
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );

    expect(conversion).toBeNull();
  });
});

describe("It fires a custom event", () => {
  test("synthetic-en:conversion event when any conversion happens", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
      "synthetic-en:conversion"
    );
  });

  test("synthetic-en:conversion:{pageType} event when a conversion happens", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[1][0].type).toBe(
      "synthetic-en:conversion:" + pageJson.pageType
    );
  });

  test("synthetic-en:conversion:group:donation event when a conversion happens on a donation page type", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.lastPage;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[2][0].type).toBe(
      "synthetic-en:conversion:group:donation"
    );
  });

  test("synthetic-en:conversion:group:donation event when a conversion happens on a premiumgift page type", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.premiumGift;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[2][0].type).toBe(
      "synthetic-en:conversion:group:donation"
    );
  });

  test("synthetic-en:conversion:group:donation event when a conversion happens on a ecommerce page type", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.ecommerce;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[2][0].type).toBe(
      "synthetic-en:conversion:group:donation"
    );
  });

  test("synthetic-en:conversion:group:submission event when a conversion happens on any other page type", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    new ENConversion(pageJsons.firstPage);
    const pageJson = pageJsons.advocacyPetition;
    new ENConversion(pageJson);

    const conversion = sessionStorage.getItem(
      "ENConversion_Converted_" + pageJson.campaignId
    );
    expect(conversion).toBe("true");

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[2][0].type).toBe(
      "synthetic-en:conversion:group:submission"
    );
  });
});
