import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/** Makes a PDF from HTML and opens the phone's share sheet so the member can save it, print it or send it. Returns false when sharing is not available. */
export async function sharePdf(html: string, title: string): Promise<boolean> {
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
  return true;
}
