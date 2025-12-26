import { ScrollView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/lib/Colors';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  // Set document title for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Privacy Policy - Meritable';
    }
  }, []);

  return (
    <ThemedView className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        style={{ backgroundColor: Colors.background }}
      >
        <ThemedText type="title" style={{ marginBottom: 24, color: Colors.text }}>
          Privacy Policy
        </ThemedText>

        <ThemedText style={{ marginBottom: 16, color: Colors.textSecondary }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Last Updated:</ThemedText> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </ThemedText>

        <ThemedText style={{ marginBottom: 24, color: Colors.text }}>
          This Privacy Policy describes how Meritable ("we", "our", or "us") handles your information when you use our habit tracking application (the "App").
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          1. Information We Collect
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Habit Data:</ThemedText> The App stores the habits you create, including habit names, completion dates, and any other data you choose to enter. This data is stored locally on your device only and is never transmitted to our servers or any third-party services.
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>No Account Required:</ThemedText> Meritable does not require you to create an account or provide any personal information such as your name, email address, or phone number. The App operates entirely offline and locally on your device.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          2. How We Use Your Information
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          Your habit data is used solely to provide the App's functionality:
        </ThemedText>

        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • Display your habits and track completion dates
        </ThemedText>
        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • Calculate streaks and provide habit statistics
        </ThemedText>
        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • Enable you to edit, reorder, and manage your habits
        </ThemedText>
        <ThemedText style={{ marginBottom: 12, marginLeft: 16, color: Colors.text }}>
          • Store your preferences and app settings
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text, marginTop: 16 }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>No Data Transmission:</ThemedText> Your data never leaves your device. We do not collect, transmit, or analyze your habit data or usage patterns.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          3. Data Storage and Security
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Local Storage Only:</ThemedText> All your habit data is stored exclusively on your device:
        </ThemedText>

        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Web:</ThemedText> Data is stored using IndexedDB (via Dexie), a browser-based database that stores data locally in your browser
        </ThemedText>
        <ThemedText style={{ marginBottom: 12, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Mobile (iOS/Android):</ThemedText> Data is stored using AsyncStorage, which stores data locally on your device
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>No Cloud Storage:</ThemedText> Your data is never uploaded to any servers, cloud services, or third-party databases. All data remains on your device and is controlled entirely by you.
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Data Security:</ThemedText> Since your data is stored locally on your device, its security depends on your device's security measures. We recommend using device passcodes, biometric authentication, and keeping your device's operating system updated.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          4. Third-Party Services
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          Meritable does not use any third-party services for data storage, authentication, or analytics. Your data is stored entirely on your device using native browser or device storage mechanisms.
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          The App may use standard device APIs and frameworks provided by your operating system (iOS, Android) or browser, but these do not transmit your data to external services.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          5. Data Sharing and Disclosure
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>No Data Sharing:</ThemedText> Since all your data is stored locally on your device and never transmitted to our servers, we do not have access to your data and therefore cannot share, sell, or disclose it to anyone.
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          Your habit data remains private and under your complete control. You can delete it at any time by clearing the App's data through your device settings or by uninstalling the App.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          6. Your Rights and Choices
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          Since all your data is stored locally on your device, you have complete control:
        </ThemedText>

        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Access:</ThemedText> You can view all your habit data at any time through the App
        </ThemedText>
        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Modify:</ThemedText> You can edit, delete, or reorder your habits directly within the App
        </ThemedText>
        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Delete:</ThemedText> You can delete all your data by clearing the App's storage through your device settings, or by uninstalling the App
        </ThemedText>
        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          • <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Export:</ThemedText> Your data is stored in standard formats (IndexedDB/AsyncStorage) that you can access through your browser's developer tools or device file system if needed
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          7. Children's Privacy
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          The App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          8. Data Retention
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          Your habit data is retained on your device for as long as you keep the App installed and do not clear its data. Since we do not have access to your data, we do not retain any copies of it. When you uninstall the App or clear its data, all stored information is permanently deleted from your device.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          9. Data Backup and Sync
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>No Automatic Backup:</ThemedText> The App does not automatically back up your data to cloud services. Your data exists only on the device where you use the App.
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Device Backups:</ThemedText> If you have enabled device-level backups (such as iCloud Backup on iOS or Google Backup on Android), your App data may be included in those backups according to your device's backup settings. This is controlled by your device's operating system, not by the App.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          10. Changes to This Privacy Policy
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 16, color: Colors.text }}>
          11. Contact Us
        </ThemedText>

        <ThemedText style={{ marginBottom: 12, color: Colors.text }}>
          If you have any questions about this Privacy Policy or our data practices, please contact us at:
        </ThemedText>

        <ThemedText style={{ marginBottom: 8, marginLeft: 16, color: Colors.text }}>
          <ThemedText style={{ fontWeight: '600', color: Colors.text }}>Email:</ThemedText> dtom90@gmail.com
        </ThemedText>

        <ThemedText style={{ marginTop: 32, marginBottom: 24, color: Colors.textSecondary, fontStyle: 'italic' }}>
          By using Meritable, you agree to the collection and use of information in accordance with this Privacy Policy.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

