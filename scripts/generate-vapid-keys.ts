import webpush from 'web-push';

function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  console.log('==============================================');
  console.log('Daily Health Companion - Generated VAPID Keys');
  console.log('==============================================');
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log('VAPID_SUBJECT=mailto:support@dailyhealth.internal');
  console.log('==============================================');
  console.log('Add these values to your Render environment or local .env file.');
}

generateVapidKeys();
