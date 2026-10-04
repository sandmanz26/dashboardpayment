/*
 * Client-side parts of the Get payment docs page that the server-rendered HTML leaves empty
 * (header content, breadcrumb, navigation tree, right "Try it" panel, follow button, response tabs).
 * No network requests are made. Tree data is injected at build time ([{"id":"8f144c44-1aa5-44ac-85e7-df47c1a3b82e","t":"Overview","c":[{"id":"e26163eb-747b-4984-8d65-bd80366e70e1","t":"Quick setup","s":"quick-setup"},{"id":"5654bf9f-878b-4700-a5c9-4aa4f9eca355","t":"Rate limits","s":"rate-limits"},{"id":"d3ab9cfb-c487-48d0-abf0-a3986c69c225","t":"Webhook behavior","s":"webhook-behavior"}]},{"id":"9fc5173a-1ff8-46c5-bbe2-e28f4848b16e","t":"Payments","c":[{"id":"77766606-8850-4dc1-8b3a-029e1b794681","t":"Introduction","s":"introduction"},{"id":"563821e8-1404-47cc-9d46-7fea3e7313f9","t":"Payment Request","c":[{"id":"e3068a1e-a6b7-42c1-9ec1-3df7f4385083","t":"Create a payment request","s":"create-payment-request","m":"POST"},{"id":"061f924e-a697-4c62-abe1-3cca05644d4d","t":"Payment webhook notification","s":"payment-webhook-notification","m":"POST"},{"id":"7737a74d-4b31-4b67-b94a-d4abb5a74658","t":"Get the status of a payment request","s":"get-payment-request","m":"GET"},{"id":"b113763d-134b-41c8-b80a-b309c2b31587","t":"Cancel a payment request","s":"cancel-payment-request","m":"POST"},{"id":"ab4dc28a-c3bd-4527-8072-669711940678","t":"Simulate payment [test mode]","s":"simulate-payment-test-mode","m":"POST"},{"id":"749ed769-69bd-47c2-9d29-d21b8c9eb4b6","t":"Check available installment plans","s":"check-available-installment-plans","m":"POST"},{"id":"485aa527-17e9-417a-9b95-f4cac1c3a828","t":"Update a payment request","s":"update-a-payment-request","m":"PATCH"}]},{"id":"85de230b-d160-49a9-91e5-c35fd09c8093","t":"Payment","c":[{"id":"3630100d-4f93-47f4-aa96-5cfd334acb7d","t":"Get the status of a payment","s":"get-payment","m":"GET"},{"id":"3f8f6ed5-6ba7-4923-bcd7-90b938155266","t":"Cancel a payment","s":"cancel-payment","m":"POST"},{"id":"f29709b3-17b4-4681-bbf6-484424755eb7","t":"Capture a payment","s":"capture-payment","m":"POST"}]},{"id":"1734d607-8986-4de2-9362-3f7e9354634d","t":"Payment Token","c":[{"id":"c60412af-7429-4ccc-9145-305b63a9872b","t":"Create a new payment token","s":"create-payment-token","m":"POST"},{"id":"62680587-7292-4cb9-89eb-3a6504adbd23","t":"Get the status of a payment token","s":"get-payment-token","m":"GET"},{"id":"e506e0b4-1ffb-402e-b829-ccb59e7d3acd","t":"Cancel and deactivate a payment token","s":"cancel-payment-token","m":"POST"},{"id":"4df086de-613e-4d8f-a899-228f1488fe3f","t":"Payment token webhook notification","s":"payment-token-webhook-notification","m":"POST"}]},{"id":"c31860f3-179c-453b-a333-34ad733eca45","t":"Session","c":[{"id":"3dd0bd1d-3f22-4247-9055-b1b946677593","t":"Create a session","s":"create-session","m":"POST"},{"id":"f9d25f51-ca8e-4728-a675-5e32588143da","t":"Get the status of a session","s":"get-session","m":"GET"},{"id":"5d580d53-d053-42db-a052-2946cb949b07","t":"Cancel a session","s":"cancel-session","m":"POST"},{"id":"2b32c821-db8a-4374-a897-cfff5cc47d30","t":"Webhook notification that will be sent to your defined webhook url for updates to payment session status","s":"webhook-notification-sent-defined-webhook-url-updates-payment-session","m":"POST"}]},{"id":"015aa6c9-7bf9-43dd-8037-86601cb10231","t":"Refund","c":[{"id":"20f3c623-aa1b-40d6-be11-861e6b5171e4","t":"Refund a payment request","s":"refund-payment-request","m":"POST"},{"id":"fa0dff0e-bde3-4f17-b0f0-230299d740c1","t":"Refund webhook notification","s":"refund-webhook-notification","m":"POST"}]},{"id":"554dfee6-c090-4b6a-9d4c-eb159c0068e5","t":"Subscriptions","c":[{"id":"4b16b07e-a237-4f61-9d10-732df1f57408","t":"Create Subscription Plan","s":"create-recurring-plan","m":"POST"},{"id":"4024c7e6-c7a4-4fde-932a-0db30fb040b4","t":"Get Subscription Plan","s":"get-subscription-plan-2","m":"GET"},{"id":"6cec0095-4f0d-40a6-9843-3324a47a868c","t":"Update Subscription Plan","s":"update-subscription-plan-2","m":"PATCH"},{"id":"e3523f69-99d3-443b-ad51-d352d94bc008","t":"Deactivate Subscription Plan","s":"deactivate-subscription-plan-2","m":"POST"},{"id":"fc7fdcd0-89c5-457b-ab27-c1a30f07cea5","t":"Get List of Subscription Cycles","s":"get-list-of-subscription-cycles-2","m":"GET"},{"id":"9be46173-dede-428c-ba30-ed6084d5fcfa","t":"Get Subscription Cycle","s":"get-subscription-cycle-2","m":"GET"},{"id":"6233c615-07d5-4614-a224-139333572d4f","t":"Update Subscription Cycle","s":"update-subscription-cycle-2","m":"PATCH"},{"id":"e551ecd9-3582-4a6a-9166-4a61a3e10f33","t":"Cancel Subscription Cycle","s":"cancel-subscription-cycle-2","m":"POST"},{"id":"b7c75f70-61d5-4380-a5bc-a9c65f617bb4","t":"Force Attempt Subscription Cycle","s":"force-attempt-subscription-cycle-2","m":"POST"},{"id":"85ac1bc4-76ea-4f2b-9a7f-ee92b6044dfb","t":"Simulate cycle payment","s":"simulate-cycle-payment","m":"POST"},{"id":"4ed86e97-f68f-41e3-8311-cb1cb3024bf4","t":"Subscription Webhook","s":"subscription-webhook","m":"POST"}]},{"id":"0dc72e38-0101-45c0-91a9-f403d6f60437","t":"Disputes","c":[{"id":"7e618230-d4e6-494e-a4cb-c79fec9d8d30","t":"Dispute Webhook Notifications","s":"dispute-webhook-notifications","m":"POST"},{"id":"4b3aef0d-eedc-40c0-acc7-d8104a349895","t":"List all disputes","s":"list-all-disputes-1","m":"GET"},{"id":"bcae19e6-8829-4c3f-89ae-7de3dc87789b","t":"Get dispute details","s":"get-dispute-details-1","m":"GET"},{"id":"13795b87-2121-4a55-b82f-606fcd2ad4b9","t":"Submit evidence via multipart upload","s":"submit-evidence-via-multipart-upload-1","m":"POST"},{"id":"1dfe8ae1-c8a9-4c11-86ba-43253efdd55d","t":"Update text evidence","s":"update-text-evidence-1","m":"PATCH"},{"id":"27c320f5-27e4-44fe-9ccb-6b4c9ebbf7c5","t":"Delete a submitted evidence","s":"delete-a-submitted-evidence-1","m":"DELETE"},{"id":"f9d60170-4d9f-4cb5-a4ca-b885247e6564","t":"Finalize and submit evidence","s":"finalize-and-submit-evidence-1","m":"POST"},{"id":"b4eb9ae7-5db8-4ca9-a3ed-9035d458cae8","t":"Accept a dispute","s":"accept-a-dispute-1","m":"POST"},{"id":"111f0382-9d57-43c0-a263-622fa8ae5c76","t":"Simulate a dispute (Sandbox Only)","s":"simulate-a-dispute-sandbox-only-1","m":"POST"}]},{"id":"d70d6e0d-cf1c-4330-b8a0-549a94c4c54c","t":"BI SNAP","s":"bi-snap"}]},{"id":"fe615967-5444-43df-b1f2-682316d6b5f0","t":"Payouts","c":[{"id":"d4daa3df-457f-467a-87bd-cb4847ab7621","t":"Introduction","s":"payouts-introduction"},{"id":"50630902-7caa-484a-a9d8-682f2d660a2a","t":"Payout","c":[{"id":"065f8e5f-8d44-4adb-be09-3159f09c9e4a","t":"Create Payout","s":"create-payout-v3","m":"POST"},{"id":"6cccc5eb-3af2-4788-9206-4f0e61069a3c","t":"Get Payout by ID","s":"get-payout-v3-by-id","m":"GET"},{"id":"f4242e2b-550e-4764-b903-0f3f3e4c1828","t":"Payout Webhook","s":"payout-v3-webhook","m":"POST"}]}]},{"id":"ba4939cd-a1a2-405b-bbdd-ac1817ce722a","t":"Foreign Exchange","c":[{"id":"ffaf50a4-f378-4aac-9891-5b5433ff2f60","t":"Introduction","s":"foreign-exchange-introduction"},{"id":"28437dfc-7f3e-441d-ac64-8fbafddb046e","t":"Foreign Exchange","c":[{"id":"f2ca8046-d6e6-4fd1-89ce-3fc0cb971304","t":"Create Quote","s":"create-quote","m":"POST"},{"id":"dd0d12d8-586f-43ff-ab5b-ef4876a3c69e","t":"Get Quote by ID","s":"get-quote-by-id","m":"GET"},{"id":"c7e447cf-dbab-42b3-9a38-876b540f4b67","t":"Create Conversion","s":"create-conversion-1","m":"POST"},{"id":"456951c8-bf57-4978-8abb-7aeed8f14015","t":"Get Conversion by ID","s":"get-conversion-by-id","m":"GET"}]}]},{"id":"071c23ef-35bf-4831-a8ab-023c81e6b03a","t":"Balance & Transactions","c":[{"id":"82499881-87f8-4a07-8c32-6f13594df910","t":"Introduction","s":"introduction-1"},{"id":"5f31fdbd-a97e-4db8-80bd-6571f032fb3f","t":"Balance","c":[{"id":"f5d84c4b-fe26-4285-b132-2c454cd8816c","t":"Get balance","s":"get-balance","m":"GET"}]},{"id":"e5f96d99-bc6c-4f04-a7a8-fb8ba91fa26f","t":"Reports","c":[{"id":"91cb93f0-f0ea-425b-99f1-5c079b32b8ce","t":"Generate Report","s":"generate-report","m":"POST"},{"id":"89906af5-4314-495d-92fd-5c059ce34035","t":"Get Report by ID","s":"get-report","m":"GET"},{"id":"a4f4eec1-7a84-4696-8e3a-22a9430e35e2","t":"Report webhook notification","s":"report-webhook-notification","m":"POST"}]},{"id":"1d38a39b-1f84-4bca-ab90-f26878df2b1b","t":"Transaction","c":[{"id":"b21fcc35-12e6-4e42-b360-3cea1ed37798","t":"Get Transaction by ID","s":"get-transaction","m":"GET"},{"id":"1058c23f-c547-462c-885e-39d4d14e3a4a","t":"List Transactions","s":"list-transactions","m":"GET"}]}]},{"id":"348e5111-1ff2-4850-be89-0cb2199e54cf","t":"xenPlatform","c":[{"id":"91beb741-c8ac-4d4a-bdf8-9d27b6a241f0","t":"Introduction","s":"accounts-misc-introduction"},{"id":"61f1b0e5-8297-43a0-bdff-4459eea6f1c5","t":"xenPlatform","c":[{"id":"2be2787a-37df-4cda-baee-0f39e0e42349","t":"Create account (v3)","s":"create-account-v3","m":"POST"},{"id":"130991a8-9852-4de1-b121-b3029adf12f8","t":"List accounts","s":"list-accounts","m":"GET"},{"id":"5b4488c1-f875-48e5-a530-ebb64f47b2f9","t":"Get account","s":"get-account","m":"GET"},{"id":"c3f12a94-43ed-4fcf-9a2c-b0d4f16fd02c","t":"Create split rule","s":"create-split-rule","m":"POST"},{"id":"473897bc-74da-4227-9587-7d64a02aec87","t":"Get transfer by reference","s":"get-transfer-by-reference","m":"GET"},{"id":"8e94e43f-a37f-4a86-a259-e322887329ac","t":"Create transfers","s":"create-transfers","m":"POST"},{"id":"2ffd848d-9dde-423a-a96b-3701b559e8ee","t":"Account suspension webhook notification","s":"account-suspension-webhook-notification","m":"POST"},{"id":"5f00bb1f-5c2d-4784-ad6d-4c7ce5de9ce2","t":"Split payment status notification webhook","s":"split-payment-status-notification-webhook","m":"POST"},{"id":"f33d294c-cf08-47ac-8e97-14560918a6b7","t":"Account verification webhook notification","s":"account-verification-webhook-notification","m":"POST"}]},{"id":"e1c57df9-c1e8-4be9-ad49-cf90509cb300","t":"Webhook Settings","c":[{"id":"595446f8-4f3a-4ce6-8415-171dca8dab62","t":"Set webhook URL","s":"set-webhook-url","m":"POST"}]},{"id":"6f43d309-f4f1-42e0-9546-96622a337f1a","t":"xenPlatform v2 (Legacy)","c":[{"id":"4a58a8b9-bd25-4a53-997d-37bb8f96c5c4","t":"Create account","s":"create-account","m":"POST"},{"id":"b455b927-f656-40a5-94de-03393e0caeb0","t":"Update account","s":"update-account","m":"PATCH"},{"id":"45457ed6-0b58-438a-8a8a-d44a896e24a0","t":"Submit account verification","s":"submit-account-verification","m":"POST"},{"id":"9e923115-86e1-4600-ae5a-a41e7b7b1bc2","t":"Retrieve account verification","s":"retrieve-account-verification","m":"GET"},{"id":"1c6c0a8d-85e8-4be9-b268-e85b13c6c73a","t":"Owned account status webhook notification","s":"owned-account-status-webhook-notification","m":"POST"},{"id":"cb43028b-8257-4367-a77d-4d6c0e1d725a","t":"Managed account status webhook notification","s":"managed-account-status-webhook-notification","m":"POST"}]},{"id":"8f3d99d7-a3cc-402f-9f00-803d4381eaf0","t":"Account Holder (Legacy)","c":[{"id":"d5dd651c-3b8b-4adb-aa40-72c7f5615296","t":"Create account holder","s":"create-account-holder","m":"POST"},{"id":"afdfdc55-0f05-400a-a1a8-5486a65c3b7d","t":"Update account holder","s":"update-account-holder","m":"PATCH"},{"id":"c08d50e2-4da2-4bee-8521-9a46341d094e","t":"Get account holder","s":"get-account-holder","m":"GET"},{"id":"28206b49-5c0b-43b0-ba46-53e97ed46bc0","t":"Account holder KYC status notification webhook","s":"account-holder-kyc-status-notification-webhook","m":"POST"},{"id":"cd1d29c7-27c8-4f2d-8cd7-8898dd942252","t":"Account holder capabilities notification webhook","s":"account-holder-capabilities-notification-webhook","m":"POST"}]}]},{"id":"bef38433-e89e-4d2f-9cea-fa9f51bea041","t":"Others","c":[{"id":"5734b2b9-8d3f-4538-bb1f-181803564531","t":"Introduction","s":"others-introduction"},{"id":"83f7959c-1eac-47fb-8c98-c05c41b700c1","t":"Customers","c":[{"id":"311607ed-f63b-4ab6-aa3b-e0025df714b2","t":"Get customers list","s":"get-customers-list","m":"GET"},{"id":"4183d231-1b9d-4aab-98ed-a03d0d064b3d","t":"Create customer request","s":"create-customer-request","m":"POST"},{"id":"fa246fa0-f415-4fff-8e29-639304fb6a79","t":"Get customer by id","s":"get-customer-id","m":"GET"},{"id":"b4b03ecd-cb30-4500-8c8b-018f8e4db3fc","t":"Update Customer","s":"update-customer","m":"PATCH"}]},{"id":"a25577b8-7f52-42c6-adc1-1e9409a7129d","t":"Bill Payments","c":[{"id":"9fbdc533-1391-42d9-8825-62f1edf0b574","t":"Products","c":[{"id":"2472a7bc-928d-4ded-ba4d-b35a96224efa","t":"Get Product List","s":"get-product-list","m":"GET"},{"id":"2a90d600-6dbb-4b8d-819a-c0406d7ea024","t":"Get Product by ID","s":"get-product-by-id","m":"GET"}]},{"id":"bdf71c41-58c5-462b-b63d-b17786a4e8bb","t":"Inquiry","c":[{"id":"8b57eb55-9c21-4e42-b0b6-4ca2bef62a80","t":"Create Inquiry","s":"create-inquiry","m":"POST"}]},{"id":"04502a34-4ffe-4e21-9e7f-3b2c0467e064","t":"Payments","c":[{"id":"a339aeeb-5489-45ce-b692-a3c69f618d8a","t":"Create Payment","s":"create-payment","m":"POST"},{"id":"e221c674-efe6-4c21-b6d5-8dcf812a445f","t":"Get Payment Detail","s":"get-payment-detail","m":"GET"},{"id":"d97f4e0a-b692-41bd-89da-6a9576c55c17","t":"Payment Status Callback (Webhook)","s":"payment-status-callback-webhook","m":"POST"}]}]},{"id":"9dc667d0-703d-4878-ad43-4ad289d1ad47","t":"Files","c":[{"id":"edf89f63-634c-4c54-802c-26cc67f896a0","t":"Get file by ID","s":"get-file-by-id","m":"GET"},{"id":"760647eb-b09b-4bd7-b2a3-0356e74e9fdb","t":"Delete file by ID","s":"delete-file-by-id","m":"DELETE"},{"id":"8606af8f-e7d5-4297-80c8-145192956ad5","t":"Download file by ID","s":"download-file-by-id","m":"GET"},{"id":"f5aa77b2-7733-4152-a0f5-330e232b4c8f","t":"Upload file","s":"upload-file","m":"POST"}]}]}]).
 */
(function () {
  'use strict';
  var TREE = [{"id":"8f144c44-1aa5-44ac-85e7-df47c1a3b82e","t":"Overview","c":[{"id":"e26163eb-747b-4984-8d65-bd80366e70e1","t":"Quick setup","s":"quick-setup"},{"id":"5654bf9f-878b-4700-a5c9-4aa4f9eca355","t":"Rate limits","s":"rate-limits"},{"id":"d3ab9cfb-c487-48d0-abf0-a3986c69c225","t":"Webhook behavior","s":"webhook-behavior"}]},{"id":"9fc5173a-1ff8-46c5-bbe2-e28f4848b16e","t":"Payments","c":[{"id":"77766606-8850-4dc1-8b3a-029e1b794681","t":"Introduction","s":"introduction"},{"id":"563821e8-1404-47cc-9d46-7fea3e7313f9","t":"Payment Request","c":[{"id":"e3068a1e-a6b7-42c1-9ec1-3df7f4385083","t":"Create a payment request","s":"create-payment-request","m":"POST"},{"id":"061f924e-a697-4c62-abe1-3cca05644d4d","t":"Payment webhook notification","s":"payment-webhook-notification","m":"POST"},{"id":"7737a74d-4b31-4b67-b94a-d4abb5a74658","t":"Get the status of a payment request","s":"get-payment-request","m":"GET"},{"id":"b113763d-134b-41c8-b80a-b309c2b31587","t":"Cancel a payment request","s":"cancel-payment-request","m":"POST"},{"id":"ab4dc28a-c3bd-4527-8072-669711940678","t":"Simulate payment [test mode]","s":"simulate-payment-test-mode","m":"POST"},{"id":"749ed769-69bd-47c2-9d29-d21b8c9eb4b6","t":"Check available installment plans","s":"check-available-installment-plans","m":"POST"},{"id":"485aa527-17e9-417a-9b95-f4cac1c3a828","t":"Update a payment request","s":"update-a-payment-request","m":"PATCH"}]},{"id":"85de230b-d160-49a9-91e5-c35fd09c8093","t":"Payment","c":[{"id":"3630100d-4f93-47f4-aa96-5cfd334acb7d","t":"Get the status of a payment","s":"get-payment","m":"GET"},{"id":"3f8f6ed5-6ba7-4923-bcd7-90b938155266","t":"Cancel a payment","s":"cancel-payment","m":"POST"},{"id":"f29709b3-17b4-4681-bbf6-484424755eb7","t":"Capture a payment","s":"capture-payment","m":"POST"}]},{"id":"1734d607-8986-4de2-9362-3f7e9354634d","t":"Payment Token","c":[{"id":"c60412af-7429-4ccc-9145-305b63a9872b","t":"Create a new payment token","s":"create-payment-token","m":"POST"},{"id":"62680587-7292-4cb9-89eb-3a6504adbd23","t":"Get the status of a payment token","s":"get-payment-token","m":"GET"},{"id":"e506e0b4-1ffb-402e-b829-ccb59e7d3acd","t":"Cancel and deactivate a payment token","s":"cancel-payment-token","m":"POST"},{"id":"4df086de-613e-4d8f-a899-228f1488fe3f","t":"Payment token webhook notification","s":"payment-token-webhook-notification","m":"POST"}]},{"id":"c31860f3-179c-453b-a333-34ad733eca45","t":"Session","c":[{"id":"3dd0bd1d-3f22-4247-9055-b1b946677593","t":"Create a session","s":"create-session","m":"POST"},{"id":"f9d25f51-ca8e-4728-a675-5e32588143da","t":"Get the status of a session","s":"get-session","m":"GET"},{"id":"5d580d53-d053-42db-a052-2946cb949b07","t":"Cancel a session","s":"cancel-session","m":"POST"},{"id":"2b32c821-db8a-4374-a897-cfff5cc47d30","t":"Webhook notification that will be sent to your defined webhook url for updates to payment session status","s":"webhook-notification-sent-defined-webhook-url-updates-payment-session","m":"POST"}]},{"id":"015aa6c9-7bf9-43dd-8037-86601cb10231","t":"Refund","c":[{"id":"20f3c623-aa1b-40d6-be11-861e6b5171e4","t":"Refund a payment request","s":"refund-payment-request","m":"POST"},{"id":"fa0dff0e-bde3-4f17-b0f0-230299d740c1","t":"Refund webhook notification","s":"refund-webhook-notification","m":"POST"}]},{"id":"554dfee6-c090-4b6a-9d4c-eb159c0068e5","t":"Subscriptions","c":[{"id":"4b16b07e-a237-4f61-9d10-732df1f57408","t":"Create Subscription Plan","s":"create-recurring-plan","m":"POST"},{"id":"4024c7e6-c7a4-4fde-932a-0db30fb040b4","t":"Get Subscription Plan","s":"get-subscription-plan-2","m":"GET"},{"id":"6cec0095-4f0d-40a6-9843-3324a47a868c","t":"Update Subscription Plan","s":"update-subscription-plan-2","m":"PATCH"},{"id":"e3523f69-99d3-443b-ad51-d352d94bc008","t":"Deactivate Subscription Plan","s":"deactivate-subscription-plan-2","m":"POST"},{"id":"fc7fdcd0-89c5-457b-ab27-c1a30f07cea5","t":"Get List of Subscription Cycles","s":"get-list-of-subscription-cycles-2","m":"GET"},{"id":"9be46173-dede-428c-ba30-ed6084d5fcfa","t":"Get Subscription Cycle","s":"get-subscription-cycle-2","m":"GET"},{"id":"6233c615-07d5-4614-a224-139333572d4f","t":"Update Subscription Cycle","s":"update-subscription-cycle-2","m":"PATCH"},{"id":"e551ecd9-3582-4a6a-9166-4a61a3e10f33","t":"Cancel Subscription Cycle","s":"cancel-subscription-cycle-2","m":"POST"},{"id":"b7c75f70-61d5-4380-a5bc-a9c65f617bb4","t":"Force Attempt Subscription Cycle","s":"force-attempt-subscription-cycle-2","m":"POST"},{"id":"85ac1bc4-76ea-4f2b-9a7f-ee92b6044dfb","t":"Simulate cycle payment","s":"simulate-cycle-payment","m":"POST"},{"id":"4ed86e97-f68f-41e3-8311-cb1cb3024bf4","t":"Subscription Webhook","s":"subscription-webhook","m":"POST"}]},{"id":"0dc72e38-0101-45c0-91a9-f403d6f60437","t":"Disputes","c":[{"id":"7e618230-d4e6-494e-a4cb-c79fec9d8d30","t":"Dispute Webhook Notifications","s":"dispute-webhook-notifications","m":"POST"},{"id":"4b3aef0d-eedc-40c0-acc7-d8104a349895","t":"List all disputes","s":"list-all-disputes-1","m":"GET"},{"id":"bcae19e6-8829-4c3f-89ae-7de3dc87789b","t":"Get dispute details","s":"get-dispute-details-1","m":"GET"},{"id":"13795b87-2121-4a55-b82f-606fcd2ad4b9","t":"Submit evidence via multipart upload","s":"submit-evidence-via-multipart-upload-1","m":"POST"},{"id":"1dfe8ae1-c8a9-4c11-86ba-43253efdd55d","t":"Update text evidence","s":"update-text-evidence-1","m":"PATCH"},{"id":"27c320f5-27e4-44fe-9ccb-6b4c9ebbf7c5","t":"Delete a submitted evidence","s":"delete-a-submitted-evidence-1","m":"DELETE"},{"id":"f9d60170-4d9f-4cb5-a4ca-b885247e6564","t":"Finalize and submit evidence","s":"finalize-and-submit-evidence-1","m":"POST"},{"id":"b4eb9ae7-5db8-4ca9-a3ed-9035d458cae8","t":"Accept a dispute","s":"accept-a-dispute-1","m":"POST"},{"id":"111f0382-9d57-43c0-a263-622fa8ae5c76","t":"Simulate a dispute (Sandbox Only)","s":"simulate-a-dispute-sandbox-only-1","m":"POST"}]},{"id":"d70d6e0d-cf1c-4330-b8a0-549a94c4c54c","t":"BI SNAP","s":"bi-snap"}]},{"id":"fe615967-5444-43df-b1f2-682316d6b5f0","t":"Payouts","c":[{"id":"d4daa3df-457f-467a-87bd-cb4847ab7621","t":"Introduction","s":"payouts-introduction"},{"id":"50630902-7caa-484a-a9d8-682f2d660a2a","t":"Payout","c":[{"id":"065f8e5f-8d44-4adb-be09-3159f09c9e4a","t":"Create Payout","s":"create-payout-v3","m":"POST"},{"id":"6cccc5eb-3af2-4788-9206-4f0e61069a3c","t":"Get Payout by ID","s":"get-payout-v3-by-id","m":"GET"},{"id":"f4242e2b-550e-4764-b903-0f3f3e4c1828","t":"Payout Webhook","s":"payout-v3-webhook","m":"POST"}]}]},{"id":"ba4939cd-a1a2-405b-bbdd-ac1817ce722a","t":"Foreign Exchange","c":[{"id":"ffaf50a4-f378-4aac-9891-5b5433ff2f60","t":"Introduction","s":"foreign-exchange-introduction"},{"id":"28437dfc-7f3e-441d-ac64-8fbafddb046e","t":"Foreign Exchange","c":[{"id":"f2ca8046-d6e6-4fd1-89ce-3fc0cb971304","t":"Create Quote","s":"create-quote","m":"POST"},{"id":"dd0d12d8-586f-43ff-ab5b-ef4876a3c69e","t":"Get Quote by ID","s":"get-quote-by-id","m":"GET"},{"id":"c7e447cf-dbab-42b3-9a38-876b540f4b67","t":"Create Conversion","s":"create-conversion-1","m":"POST"},{"id":"456951c8-bf57-4978-8abb-7aeed8f14015","t":"Get Conversion by ID","s":"get-conversion-by-id","m":"GET"}]}]},{"id":"071c23ef-35bf-4831-a8ab-023c81e6b03a","t":"Balance & Transactions","c":[{"id":"82499881-87f8-4a07-8c32-6f13594df910","t":"Introduction","s":"introduction-1"},{"id":"5f31fdbd-a97e-4db8-80bd-6571f032fb3f","t":"Balance","c":[{"id":"f5d84c4b-fe26-4285-b132-2c454cd8816c","t":"Get balance","s":"get-balance","m":"GET"}]},{"id":"e5f96d99-bc6c-4f04-a7a8-fb8ba91fa26f","t":"Reports","c":[{"id":"91cb93f0-f0ea-425b-99f1-5c079b32b8ce","t":"Generate Report","s":"generate-report","m":"POST"},{"id":"89906af5-4314-495d-92fd-5c059ce34035","t":"Get Report by ID","s":"get-report","m":"GET"},{"id":"a4f4eec1-7a84-4696-8e3a-22a9430e35e2","t":"Report webhook notification","s":"report-webhook-notification","m":"POST"}]},{"id":"1d38a39b-1f84-4bca-ab90-f26878df2b1b","t":"Transaction","c":[{"id":"b21fcc35-12e6-4e42-b360-3cea1ed37798","t":"Get Transaction by ID","s":"get-transaction","m":"GET"},{"id":"1058c23f-c547-462c-885e-39d4d14e3a4a","t":"List Transactions","s":"list-transactions","m":"GET"}]}]},{"id":"348e5111-1ff2-4850-be89-0cb2199e54cf","t":"xenPlatform","c":[{"id":"91beb741-c8ac-4d4a-bdf8-9d27b6a241f0","t":"Introduction","s":"accounts-misc-introduction"},{"id":"61f1b0e5-8297-43a0-bdff-4459eea6f1c5","t":"xenPlatform","c":[{"id":"2be2787a-37df-4cda-baee-0f39e0e42349","t":"Create account (v3)","s":"create-account-v3","m":"POST"},{"id":"130991a8-9852-4de1-b121-b3029adf12f8","t":"List accounts","s":"list-accounts","m":"GET"},{"id":"5b4488c1-f875-48e5-a530-ebb64f47b2f9","t":"Get account","s":"get-account","m":"GET"},{"id":"c3f12a94-43ed-4fcf-9a2c-b0d4f16fd02c","t":"Create split rule","s":"create-split-rule","m":"POST"},{"id":"473897bc-74da-4227-9587-7d64a02aec87","t":"Get transfer by reference","s":"get-transfer-by-reference","m":"GET"},{"id":"8e94e43f-a37f-4a86-a259-e322887329ac","t":"Create transfers","s":"create-transfers","m":"POST"},{"id":"2ffd848d-9dde-423a-a96b-3701b559e8ee","t":"Account suspension webhook notification","s":"account-suspension-webhook-notification","m":"POST"},{"id":"5f00bb1f-5c2d-4784-ad6d-4c7ce5de9ce2","t":"Split payment status notification webhook","s":"split-payment-status-notification-webhook","m":"POST"},{"id":"f33d294c-cf08-47ac-8e97-14560918a6b7","t":"Account verification webhook notification","s":"account-verification-webhook-notification","m":"POST"}]},{"id":"e1c57df9-c1e8-4be9-ad49-cf90509cb300","t":"Webhook Settings","c":[{"id":"595446f8-4f3a-4ce6-8415-171dca8dab62","t":"Set webhook URL","s":"set-webhook-url","m":"POST"}]},{"id":"6f43d309-f4f1-42e0-9546-96622a337f1a","t":"xenPlatform v2 (Legacy)","c":[{"id":"4a58a8b9-bd25-4a53-997d-37bb8f96c5c4","t":"Create account","s":"create-account","m":"POST"},{"id":"b455b927-f656-40a5-94de-03393e0caeb0","t":"Update account","s":"update-account","m":"PATCH"},{"id":"45457ed6-0b58-438a-8a8a-d44a896e24a0","t":"Submit account verification","s":"submit-account-verification","m":"POST"},{"id":"9e923115-86e1-4600-ae5a-a41e7b7b1bc2","t":"Retrieve account verification","s":"retrieve-account-verification","m":"GET"},{"id":"1c6c0a8d-85e8-4be9-b268-e85b13c6c73a","t":"Owned account status webhook notification","s":"owned-account-status-webhook-notification","m":"POST"},{"id":"cb43028b-8257-4367-a77d-4d6c0e1d725a","t":"Managed account status webhook notification","s":"managed-account-status-webhook-notification","m":"POST"}]},{"id":"8f3d99d7-a3cc-402f-9f00-803d4381eaf0","t":"Account Holder (Legacy)","c":[{"id":"d5dd651c-3b8b-4adb-aa40-72c7f5615296","t":"Create account holder","s":"create-account-holder","m":"POST"},{"id":"afdfdc55-0f05-400a-a1a8-5486a65c3b7d","t":"Update account holder","s":"update-account-holder","m":"PATCH"},{"id":"c08d50e2-4da2-4bee-8521-9a46341d094e","t":"Get account holder","s":"get-account-holder","m":"GET"},{"id":"28206b49-5c0b-43b0-ba46-53e97ed46bc0","t":"Account holder KYC status notification webhook","s":"account-holder-kyc-status-notification-webhook","m":"POST"},{"id":"cd1d29c7-27c8-4f2d-8cd7-8898dd942252","t":"Account holder capabilities notification webhook","s":"account-holder-capabilities-notification-webhook","m":"POST"}]}]},{"id":"bef38433-e89e-4d2f-9cea-fa9f51bea041","t":"Others","c":[{"id":"5734b2b9-8d3f-4538-bb1f-181803564531","t":"Introduction","s":"others-introduction"},{"id":"83f7959c-1eac-47fb-8c98-c05c41b700c1","t":"Customers","c":[{"id":"311607ed-f63b-4ab6-aa3b-e0025df714b2","t":"Get customers list","s":"get-customers-list","m":"GET"},{"id":"4183d231-1b9d-4aab-98ed-a03d0d064b3d","t":"Create customer request","s":"create-customer-request","m":"POST"},{"id":"fa246fa0-f415-4fff-8e29-639304fb6a79","t":"Get customer by id","s":"get-customer-id","m":"GET"},{"id":"b4b03ecd-cb30-4500-8c8b-018f8e4db3fc","t":"Update Customer","s":"update-customer","m":"PATCH"}]},{"id":"a25577b8-7f52-42c6-adc1-1e9409a7129d","t":"Bill Payments","c":[{"id":"9fbdc533-1391-42d9-8825-62f1edf0b574","t":"Products","c":[{"id":"2472a7bc-928d-4ded-ba4d-b35a96224efa","t":"Get Product List","s":"get-product-list","m":"GET"},{"id":"2a90d600-6dbb-4b8d-819a-c0406d7ea024","t":"Get Product by ID","s":"get-product-by-id","m":"GET"}]},{"id":"bdf71c41-58c5-462b-b63d-b17786a4e8bb","t":"Inquiry","c":[{"id":"8b57eb55-9c21-4e42-b0b6-4ca2bef62a80","t":"Create Inquiry","s":"create-inquiry","m":"POST"}]},{"id":"04502a34-4ffe-4e21-9e7f-3b2c0467e064","t":"Payments","c":[{"id":"a339aeeb-5489-45ce-b692-a3c69f618d8a","t":"Create Payment","s":"create-payment","m":"POST"},{"id":"e221c674-efe6-4c21-b6d5-8dcf812a445f","t":"Get Payment Detail","s":"get-payment-detail","m":"GET"},{"id":"d97f4e0a-b692-41bd-89da-6a9576c55c17","t":"Payment Status Callback (Webhook)","s":"payment-status-callback-webhook","m":"POST"}]}]},{"id":"9dc667d0-703d-4878-ad43-4ad289d1ad47","t":"Files","c":[{"id":"edf89f63-634c-4c54-802c-26cc67f896a0","t":"Get file by ID","s":"get-file-by-id","m":"GET"},{"id":"760647eb-b09b-4bd7-b2a3-0356e74e9fdb","t":"Delete file by ID","s":"delete-file-by-id","m":"DELETE"},{"id":"8606af8f-e7d5-4297-80c8-145192956ad5","t":"Download file by ID","s":"download-file-by-id","m":"GET"},{"id":"f5aa77b2-7733-4152-a0f5-330e232b4c8f","t":"Upload file","s":"upload-file","m":"POST"}]}]}];
  var CURRENT = 'get-payment';
  var ASSET = '/apidocs/assets/';
  var DOCS = 'https://docs.xendit.co';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function scope(el) {
    if (!el) return null;
    for (var i = 0; i < el.attributes.length; i++) if (el.attributes[i].name.indexOf('_ngcontent') === 0) return el.attributes[i].name;
    return null;
  }
  /** create element; `sc` is the Angular scope attribute so component-scoped styles still apply */
  function h(tag, cls, attrs, kids, sc) {
    var e = document.createElement(tag);
    if (sc) e.setAttribute(sc, '');
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function icon(cls) { return h('i', cls, { 'aria-hidden': 'true' }); }

  /* ---------- header ---------- */
  function buildHeader() {
    var primary = $('.primary-nav-bar-container');
    var sc = scope(primary);
    if (!primary) return;
    primary.innerHTML = '';
    primary.appendChild(
      h('div', 'nav-bar primary-nav-bar', null, [
        h('div', 'nav-bar-brand', null, [h('a', null, { href: DOCS + '/', 'aria-label': 'Xendit docs home' }, [h('img', null, { src: ASSET + 'logo_dark.png', alt: 'Xendit' }, null, sc)], sc)], sc),
        h('div', 'nav-bar-left', null, [], sc),
        h('div', 'nav-bar-right', null, [
          h('div', 'nav-bar-nav', null, [
            h('ul', null, null, [
              h('li', null, null, [h('a', 'btn btn-secondary xd-doc-btn', { href: 'https://xendit-docs.document360.io/docs/overview' }, [h('span', null, null, ['Documentation'], sc)], sc)], sc),
              h('li', null, null, [h('a', 'xd-login', { href: DOCS + '/login?returnTo=%2Fapidocs%2F' + CURRENT, 'aria-disabled': 'true' }, [h('span', null, null, ['Login'], sc)], sc)], sc),
            ], sc),
          ], sc),
        ], sc),
      ], sc)
    );
    var li = $('.breadcrumb-nav .secondaryUL li');
    if (li) {
      var bsc = scope($('.breadcrumb-nav ul'));
      var ul = $('.breadcrumb-nav .secondaryUL');
      ul.innerHTML = '';
      [['API Documentation', '/apidocs'], ['Payments', null], ['Payment', null]].forEach(function (c, i, a) {
        var last = i === a.length - 1;
        ul.appendChild(h('li', last ? 'no-arrow min-w-0' : 'min-w-0', null, [
          last ? h('span', 'xd-crumb current', null, [c[0]], bsc) : h('a', 'xd-crumb', { href: DOCS + (c[1] || '/apidocs') }, [c[0]], bsc),
          last ? null : icon('fa-regular fa-angle-right xd-sep'),
        ], bsc));
      });
    }
  }

  /* ---------- navigation tree ---------- */
  function buildTree() {
    var host = $('site-category-list-tree-view');
    if (!host) return;
    var expanded = {};
    function findPath(nodes, path) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.s === CURRENT) return path.concat([n]);
        var r = n.c && findPath(n.c, path.concat([n]));
        if (r) return r;
      }
      return null;
    }
    (findPath(TREE, []) || []).forEach(function (n) { expanded[n.id] = true; });
    TREE.forEach(function (n) { expanded[n.id] = true; }); // top-level groups start open

    var wrap = h('div', 'xd-tree');
    var vs = h('div', 'virtual-scroll');
    var vp = h('div', 'virtual-scroll-container', { role: 'tree' });
    vs.appendChild(vp);
    wrap.appendChild(vs);
    host.innerHTML = '';
    host.appendChild(wrap);

    function row(n, level) {
      var isGroup = level === 0 && n.c && n.c.length;
      var hasKids = n.c && n.c.length;
      var active = n.s === CURRENT;
      var r = h('div', 'node tree-wrapper' + (active ? ' active' : '') + (isGroup ? ' xd-root' : ''), { role: 'treeitem', 'data-id': n.id });
      for (var i = 0; i < level; i++) r.appendChild(h('div', 'filler'));
      if (hasKids) {
        var arrow = h('div', 'tree-arrow', { role: 'button', tabindex: '0', 'aria-expanded': String(!!expanded[n.id]), 'aria-label': (expanded[n.id] ? 'Collapse ' : 'Expand ') + n.t + ' section' },
          [icon(expanded[n.id] ? 'fa-solid fa-angle-down' : 'fa-solid fa-angle-right')]);
        arrow.addEventListener('click', function () { expanded[n.id] = !expanded[n.id]; render(); });
        arrow.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); arrow.click(); } });
        r.appendChild(arrow);
      } else {
        r.appendChild(h('div', 'tree-active-circle', null, [icon('fa-solid fa-circle')]));
      }
      if (n.m) r.appendChild(h('div', 'method-type method-' + n.m, null, [n.m]));
      if (n.s) r.appendChild(h('a', 'data-title', { href: n.s === CURRENT ? '#' : DOCS + '/apidocs/' + n.s, 'aria-current': active ? 'page' : null }, [n.t]));
      else {
        var t = h('a', 'data-title', { href: '#', role: 'button' }, [n.t]);
        t.addEventListener('click', function (e) { e.preventDefault(); if (hasKids) { expanded[n.id] = !expanded[n.id]; render(); } });
        r.appendChild(t);
      }
      if (isGroup) r.appendChild(h('div', 'xd-dots', { 'aria-hidden': 'true' }, [icon('fa-sharp fa-solid fa-ellipsis')]));
      return r;
    }
    var query = '';
    function filterNodes(nodes, q) {
      var out = [];
      nodes.forEach(function (n) {
        var kids = n.c ? filterNodes(n.c, q) : [];
        if (kids.length || n.t.toLowerCase().indexOf(q) >= 0) out.push(Object.assign({}, n, { c: kids.length ? kids : undefined }));
      });
      return out;
    }
    function walk(nodes, level) {
      nodes.forEach(function (n) {
        vp.appendChild(row(n, level));
        if (n.c && n.c.length && (query || expanded[n.id])) walk(n.c, level + 1);
      });
    }
    window.__xdFilter = function (q) { query = (q || '').trim().toLowerCase(); vp.scrollTop = 0; render(); };
    function render() {
      var top = vp.scrollTop;
      vp.innerHTML = '';
      walk(query ? filterNodes(TREE, query) : TREE, 0);
      vp.scrollTop = top;
      if (typeof syncSb === 'function' && track) syncSb();
    }
    var track = h('div', 'xd-sb', { 'aria-hidden': 'true' }, [h('div', 'xd-sb-thumb')]);
    vs.appendChild(track);
    var thumb = track.firstChild;
    function syncSb() {
      var ch = vp.clientHeight, sh = vp.scrollHeight;
      track.style.display = sh > ch + 1 ? '' : 'none';
      var th = Math.max(32, ch * ch / sh);
      thumb.style.height = th + 'px';
      thumb.style.transform = 'translateY(' + (vp.scrollTop / (sh - ch || 1)) * (ch - th) + 'px)';
    }
    vp.addEventListener('scroll', syncSb);
    window.addEventListener('resize', syncSb);
    render();
    // scroll so the first page-level entry ("Webhook behavior") sits at the top, as on the live page
    var focus = $('.tree-wrapper[data-id="' + (window.__XD_SCROLL_TO || '') + '"]', vp);
    var target = $$('.tree-wrapper', vp).filter(function (r) { var d = $('.data-title', r); return d && d.textContent === 'Webhook behavior'; })[0];
    if (target) vp.scrollTop = target.offsetTop - vp.offsetTop;
    syncSb();
  }

  /* ---------- article follow button ---------- */
  function buildFollow() {
    var more = $('.article-info-bottom .article-more-options');
    if (!more) return;
    var sc = scope(more);
    var btn = h('button', 'btn btn-secondary xd-follow', { type: 'button' }, [icon('fa-regular fa-bell-plus'), h('span', null, null, ['FOLLOW'], sc)], sc);
    more.parentNode.insertBefore(h('div', 'article-follow', null, [btn], sc), more);
  }

  /* ---------- response tabs (200 / 400 / 404 / 500) ---------- */
  function buildResponseTabs() {
    var body = $('.api-response-body > .api-content');
    if (!body) return;
    var blocks = $$(':scope > .api-response', body);
    if (blocks.length < 2) return;
    var bar = h('div', 'xd-resp-tabs', { role: 'tablist' });
    blocks.forEach(function (b, i) {
      var head = $('.api-status', b);
      var code = $('.api-code', b).textContent.trim();
      var tab = h('button', 'xd-resp-tab ' + (head.className.match(/api-status-[a-z-]+/) || [''])[0], { type: 'button', role: 'tab', 'aria-selected': String(i === 0) }, [h('span', 'dot'), code]);
      tab.addEventListener('click', function () { select(i); });
      bar.appendChild(tab);
    });
    body.insertBefore(bar, body.firstChild);
    blocks.forEach(function (b) {
      var c = $('.api-content', b);
      if (!c) return;
      var ex = h('button', 'xd-close-example', { type: 'button' }, ['Hide sample']);
      ex.addEventListener('click', function () {
        var closed = c.classList.toggle('xd-example-closed');
        ex.textContent = closed ? 'Show sample' : 'Hide sample';
      });
      c.insertBefore(ex, c.firstChild);
    });
    function select(i) {
      blocks.forEach(function (b, j) { b.classList.toggle('xd-hidden', j !== i); });
      $$('.xd-resp-tab', bar).forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); });
    }
    blocks.forEach(function (b) { var hd = $('.api-status', b); if (hd) hd.classList.add('xd-hidden'); });
    select(0);
  }

  /* ---------- right panel: Try it / Code samples ---------- */
  function buildTryIt() {
    var host = $('.right-panel-content');
    if (!host) return;
    host.innerHTML = '';
    var tabs = h('ul', 'nav nav-tabs xd-tabs', { role: 'tablist' }, [
      h('li', 'nav-item', null, [h('button', 'nav-link active', { type: 'button', role: 'tab', 'data-tab': 'try', 'aria-selected': 'true' }, [icon('fa-solid fa-rocket-launch'), 'TRY IT'])]),
      h('li', 'nav-item', null, [h('button', 'nav-link', { type: 'button', role: 'tab', 'data-tab': 'code', 'aria-selected': 'false' }, [icon('fa-regular fa-message-code'), 'CODE SAMPLES'])]),
    ]);

    function field(label, required, control, extra) {
      return h('div', 'xd-field' + (extra ? ' ' + extra : ''), null, [h('label', null, null, [label, required ? h('span', 'req' + (label === 'payment_id' ? ' req-sm' : ''), null, ['*']) : null]), control]);
    }
    var user = h('input', 'form-control xd-invalid', { type: 'text', placeholder: 'username', autocomplete: 'off', 'aria-label': 'Username' });
    var pass = h('input', 'form-control xd-pass', { type: 'password', value: '', placeholder: '••••••••', autocomplete: 'off', 'aria-label': 'Password' });
    var url = h('input', 'form-control xd-readonly', { type: 'text', value: 'https://api.xendit.co', readonly: 'readonly', 'aria-label': 'URL' });
    var pid = h('input', 'form-control', { type: 'text', placeholder: 'string', autocomplete: 'off', 'aria-label': 'payment_id' });
    var ver = h('select', 'form-select', { 'aria-label': 'api-version' }, [h('option', null, { value: '2024-11-11' }, ['2024-11-11'])]);
    var send = h('button', 'btn btn-primary xd-send', { type: 'button', id: 'tryit-btn', disabled: 'disabled' }, ['Try it & see response']);
    var note = h('div', 'xd-note', { role: 'status', hidden: 'hidden' }, ['Requests are not sent from this copy of the page.']);

    function accordion(id, title, bodyEls, open) {
      var item = h('div', 'accordion-item' + (open ? '' : ' xd-collapsed'), { 'data-acc': id });
      var btn = h('button', 'accordion-button' + (open ? '' : ' collapsed'), { type: 'button', 'aria-expanded': String(open) }, [title]);
      var coll = h('div', 'accordion-collapse collapse' + (open ? ' show' : ''), null, [h('div', 'accordion-body', null, bodyEls)]);
      btn.addEventListener('click', function () {
        var o = coll.classList.toggle('show');
        btn.classList.toggle('collapsed', !o); btn.setAttribute('aria-expanded', String(o)); item.classList.toggle('xd-collapsed', !o);
      });
      item.appendChild(h('h2', 'accordion-header', null, [btn]));
      item.appendChild(coll);
      return item;
    }
    var tryPane = h('div', 'xd-pane', { 'data-pane': 'try' }, [
      h('div', 'accordion', null, [
        accordion('auth', 'Authentication', [field('Username', true, user), field('Password', false, pass)], true),
        accordion('request', 'Request', [field('URL', false, url), field('payment_id', true, pid), field('api-version', false, ver), send, note], true),
        accordion('response', 'Response', [h('div', 'xd-resp-empty', null, ['Send a request to see the response.'])], false),
      ]),
    ]);
    var curl = "curl --request GET \\\n  --url 'https://api.xendit.co/v3/payments/{payment_id}' \\\n  --header 'api-version: 2024-11-11' \\\n  --user '{username}:{password}'";
    var codePane = h('div', 'xd-pane', { 'data-pane': 'code', hidden: 'hidden' }, [
      h('div', 'xd-code-label', null, ['cURL']), h('pre', 'xd-code', null, [h('code', null, null, [curl])]),
    ]);
    host.appendChild(tabs); host.appendChild(tryPane); host.appendChild(codePane);

    $$('.nav-link', tabs).forEach(function (b) {
      b.addEventListener('click', function () {
        var which = b.getAttribute('data-tab');
        $$('.nav-link', tabs).forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', String(on)); });
        tryPane.hidden = which !== 'try'; codePane.hidden = which !== 'code';
      });
    });
    function sync() { var ok = user.value.trim() && pid.value.trim(); send.disabled = !ok; user.classList.toggle('xd-invalid', !user.value.trim()); }
    user.addEventListener('input', sync); pid.addEventListener('input', sync);
    send.addEventListener('click', function () {
      note.hidden = false;
      var resp = $('[data-acc="response"]');
      $('.accordion-collapse', resp).classList.add('show'); $('.accordion-button', resp).classList.remove('collapsed'); resp.classList.remove('xd-collapsed');
    });
  }

  /* ---------- misc ---------- */
  function wireBanner() {
    var close = $('.smart-bar-close');
    if (close) close.addEventListener('click', function () { var b = close.closest('.info-bar'); if (b) b.parentNode.removeChild(b); });
  }
  function wireCollapse() {
    var btn = $('.expand-collapse-btn'); var panel = $('.left-container');
    if (!btn || !panel) return;
    var host = $('site-docs-left-panel-container');
    btn.addEventListener('click', function () {
      var c = panel.classList.toggle('left-container-collapsed');
      if (host) host.classList.toggle('xd-collapsed', c);
      btn.setAttribute('aria-expanded', String(!c));
    });
  }
  function wireFilter() {
    var input = $('.filter-input'); var clear = $('.btn-clear-filter');
    if (!input) return;
    function apply() { if (window.__xdFilter) window.__xdFilter(input.value); }
    input.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
  }

  /* ---------- endpoint bar: copy, path variables, sticky context ---------- */
  var SECTIONS = [];

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function copyBtn(getText, label) {
    var b = h('button', 'xd-copy', { type: 'button', title: label, 'aria-label': label }, [icon('fa-regular fa-copy'), h('span', 'xd-copy-t', null, ['Copy'])]);
    b.addEventListener('click', function () {
      var t = getText();
      var done = function () { b.classList.add('ok'); $('.xd-copy-t', b).textContent = 'Copied'; setTimeout(function () { b.classList.remove('ok'); $('.xd-copy-t', b).textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () {});
      else { var ta = h('textarea', null, { style: 'position:fixed;opacity:0' }); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
    });
    return b;
  }

  /** Split "/v3/payments/{payment_id}" so the variable reads as a variable. */
  function decoratePath(el) {
    var raw = el.textContent.trim();
    el.textContent = '';
    raw.split(/(\{[^}]+\})/).forEach(function (part) {
      if (!part) return;
      if (part.charAt(0) === '{') el.appendChild(h('span', 'xd-pathvar', null, [part]));
      else el.appendChild(document.createTextNode(part));
    });
    return raw;
  }

  function buildEndpointBar() {
    var sec = $('.api-section.api-path');
    if (!sec) return;
    var url = $('.api-url, .url, .api-path-url', sec) || (function () {
      // the path text sits next to the method chip; pick the longest text node holder
      var best = null;
      $$('*', sec).forEach(function (n) { if (n.children.length === 0 && /^\//.test(n.textContent.trim())) best = n; });
      return best;
    })();
    var method = (($('.api-method, .method, .http-method', sec) || {}).textContent || 'GET').trim().toUpperCase();
    var path = url ? decoratePath(url) : '';
    var full = 'https://api.xendit.co' + path;

    var tools = h('div', 'xd-ep-tools', null, [
      copyBtn(function () { return full; }, 'Copy request URL'),
    ]);
    sec.classList.add('xd-ep');
    sec.setAttribute('data-method', method);
    sec.appendChild(tools);

    // Sticky context: the bar compacts once the page scrolls past its resting place.
    var sentinel = h('div', 'xd-ep-sentinel');
    sec.parentNode.insertBefore(sentinel, sec);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { sec.classList.toggle('xd-stuck', !es[0].isIntersecting); }, { threshold: 1 }).observe(sentinel);
    }

    // Jump pills live inside the bar, so the section you are in is always on screen.
    var rail = h('nav', 'xd-jump', { 'aria-label': 'Jump to section' });
    var host = sec.parentNode;
    $$(':scope > .api-section, :scope > .api-response-body', host).forEach(function (s) {
      if (s === sec) return;
      var head = $('.api-header', s);
      var name = head ? head.textContent.trim() : '';
      if (!name) return;
      var id = 'xd-sec-' + slug(name);
      s.id = id;
      var pill = h('a', 'xd-pill', { href: '#' + id }, [name]);
      pill.addEventListener('click', function (e) {
        e.preventDefault();
        // clear the sticky header plus the bar itself, so the section heading is not hidden under them
        var off = 104 + sec.offsetHeight + 16;
        window.scrollTo({ top: s.getBoundingClientRect().top + window.pageYOffset - off, behavior: 'smooth' });
        history.replaceState(null, '', '#' + id);
      });
      rail.appendChild(pill);
      SECTIONS.push({ el: s, pill: pill });
    });
    if (SECTIONS.length) {
      sec.appendChild(rail);
      var spy = function () {
        var best = SECTIONS[0], y = window.pageYOffset + 200;
        SECTIONS.forEach(function (s) { if (s.el.getBoundingClientRect().top + window.pageYOffset <= y) best = s; });
        SECTIONS.forEach(function (s) { s.pill.classList.toggle('on', s === best); });
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
    }
  }

  /* ---------- response tabs: say what the code means ---------- */
  var CODE_LABEL = { '200': 'OK', '201': 'Created', '400': 'Bad request', '401': 'Unauthorized', '403': 'Forbidden', '404': 'Not found', '409': 'Conflict', '422': 'Unprocessable', '429': 'Rate limited', '500': 'Server error', '503': 'Unavailable' };
  function labelResponseTabs() {
    $$('.xd-resp-tab').forEach(function (t) {
      var code = t.textContent.trim();
      var lbl = CODE_LABEL[code];
      if (lbl) t.appendChild(h('span', 'xd-tab-label', null, [lbl]));
    });
  }

  /* ---------- schema browser: collapse, filter, deep-link ---------- */
  function fieldsIn(el) { return $$('.api-schema-property', el); }

  function nameOf(obj) {
    var t = $(':scope > .api-schema-title', obj);
    if (!t) return '';
    var n = $('.name', t);
    if (n && n.textContent.trim()) return n.textContent.trim();
    // Document360 puts a nested object's name in the type cell: "payment_detailsobject (...)"
    var raw = (t.textContent || '').trim();
    var m = raw.match(/^([a-z_][a-z0-9_]*)\s*object/i);
    return m ? m[1] : '';
  }

  function buildSchemaTools() {
    var body = $('.api-response-body');
    if (!body) return;
    var head = $('.api-header.api-response-body-header', body);

    /* --- collapsible objects --- */
    $$('.api-schema-object', body).forEach(function (obj) {
      var level = $(':scope > .indent-level', obj);
      if (!level) return;
      var count = fieldsIn(level).length;
      if (!count) return;
      var depth = 0, p = obj.parentElement;
      while (p && p !== body) { if (p.classList && p.classList.contains('api-schema-object')) depth++; p = p.parentElement; }
      var title = $(':scope > .api-schema-title', obj);
      var nm = nameOf(obj);
      // The vendor title only repeats "object" plus a sentence, so it moves into the toggle.
      var blurb = title ? (($('.description', title) || {}).textContent || '').trim() : '';
      var toggle = h('button', 'xd-obj-toggle', { type: 'button', 'aria-expanded': 'true' }, [
        icon('fa-regular fa-chevron-down xd-chev'),
        h('span', 'xd-obj-name', null, [nm || (depth === 0 ? 'Response body' : 'object')]),
        nm || depth > 0 ? h('span', 'xd-obj-type', null, ['object']) : null,
        h('span', 'xd-obj-count', null, [count + (count === 1 ? ' field' : ' fields')]),
        blurb ? h('span', 'xd-obj-desc', null, [blurb]) : null,
      ]);
      toggle.addEventListener('click', function () { setOpen(obj, obj.classList.contains('xd-closed')); });
      obj.classList.add('xd-obj');
      obj.setAttribute('data-depth', String(depth));
      if (title) title.parentNode.insertBefore(toggle, title); else obj.insertBefore(toggle, level);
      // Nested objects start closed: the top level of a response should fit on one screen.
      if (depth > 0) setOpen(obj, false);
    });

    function setOpen(obj, open) {
      obj.classList.toggle('xd-closed', !open);
      var t = $(':scope > .xd-obj-toggle', obj);
      if (t) t.setAttribute('aria-expanded', String(open));
    }

    /* --- per-field anchors --- */
    var seen = {};
    fieldsIn(body).forEach(function (f) {
      var n = $('.name', f);
      if (!n) return;
      var nm = n.textContent.trim();
      if (!nm) return;
      f.dataset.xdName = nm;
      // keep the identifier itself in the anchor: #field-reference_id reads better than a slug
      var id = 'field-' + nm.replace(/[^A-Za-z0-9_.-]+/g, '-');
      if (seen[id]) { seen[id]++; id = id + '-' + seen[id]; } else seen[id] = 1;
      f.id = id;
      var a = h('button', 'xd-anchor', { type: 'button', title: 'Copy link to ' + nm, 'aria-label': 'Copy link to ' + nm }, [icon('fa-regular fa-link')]);
      a.addEventListener('click', function () {
        var href = location.origin + location.pathname + '#' + id;
        if (navigator.clipboard) navigator.clipboard.writeText(href).catch(function () {});
        history.replaceState(null, '', '#' + id);
        f.classList.add('xd-flash'); setTimeout(function () { f.classList.remove('xd-flash'); }, 900);
      });
      n.appendChild(a);
    });

    /* --- toolbar: filter + expand all --- */
    if (!head) return;
    var input = h('input', 'xd-filter-input', { type: 'search', placeholder: 'Filter fields…', 'aria-label': 'Filter response fields', spellcheck: 'false' });
    var count = h('span', 'xd-filter-count', { role: 'status' });
    var expand = h('button', 'xd-ghost', { type: 'button' }, ['Expand all']);
    var collapse = h('button', 'xd-ghost', { type: 'button' }, ['Collapse all']);
    head.classList.add('xd-resp-head');
    head.appendChild(h('div', 'xd-tools', null, [
      h('div', 'xd-filter', null, [icon('fa-regular fa-magnifying-glass xd-filter-ic'), input, count]),
      expand, collapse,
    ]));

    function visibleBlock() { return $$('.api-response-body > .api-content > .api-response').filter(function (b) { return !b.classList.contains('xd-hidden'); })[0] || body; }
    function allObjs(root) { return $$('.api-schema-object.xd-obj', root); }
    expand.addEventListener('click', function () { allObjs(visibleBlock()).forEach(function (o) { setOpen(o, true); }); });
    collapse.addEventListener('click', function () { allObjs(visibleBlock()).forEach(function (o) { setOpen(o, Number(o.getAttribute('data-depth')) === 0); }); });

    /** Re-render a description with every occurrence of `q` wrapped in <mark>. */
    function markDesc(f, q) {
      var d = $(':scope > .api-schema-title > .description', f);
      if (!d) return;
      if (f._xdDesc === undefined) f._xdDesc = d.innerHTML;
      d.innerHTML = f._xdDesc;
      if (!q) return;
      var walker = document.createTreeWalker(d, NodeFilter.SHOW_TEXT, null);
      var nodes = [], t;
      while ((t = walker.nextNode())) nodes.push(t);
      nodes.forEach(function (node) {
        var text = node.nodeValue, i = text.toLowerCase().indexOf(q);
        if (i < 0) return;
        var frag = document.createDocumentFragment(), pos = 0;
        while (i >= 0) {
          frag.appendChild(document.createTextNode(text.slice(pos, i)));
          frag.appendChild(h('mark', 'xd-mark', null, [text.slice(i, i + q.length)]));
          pos = i + q.length;
          i = text.toLowerCase().indexOf(q, pos);
        }
        frag.appendChild(document.createTextNode(text.slice(pos)));
        node.parentNode.replaceChild(frag, node);
      });
    }

    function mark(f, q) {
      markDesc(f, q);
      var n = $('.name', f);
      if (!n) return;
      var nm = f.dataset.xdName || '';
      var a = $('.xd-anchor', n);
      n.textContent = '';
      var i = q ? nm.toLowerCase().indexOf(q) : -1;
      if (i < 0) n.appendChild(document.createTextNode(nm));
      else {
        n.appendChild(document.createTextNode(nm.slice(0, i)));
        n.appendChild(h('mark', 'xd-mark', null, [nm.slice(i, i + q.length)]));
        n.appendChild(document.createTextNode(nm.slice(i + q.length)));
      }
      if (a) n.appendChild(a);
    }

    function apply() {
      var q = input.value.trim().toLowerCase();
      var block = visibleBlock();
      var fields = fieldsIn(block);
      var hits = 0;
      fields.forEach(function (f) {
        var nm = (f.dataset.xdName || '').toLowerCase();
        var desc = ($('.description', f) || {}).textContent || '';
        var on = !q || nm.indexOf(q) >= 0 || desc.toLowerCase().indexOf(q) >= 0;
        f.classList.toggle('xd-nomatch', !on);
        if (on && q) hits++;
        mark(f, q);
      });
      allObjs(block).forEach(function (o) {
        var inner = fieldsIn(o).filter(function (f) { return !f.classList.contains('xd-nomatch'); }).length;
        o.classList.toggle('xd-nomatch', !!q && inner === 0);
        if (q && inner) setOpen(o, true);
        else if (!q) setOpen(o, Number(o.getAttribute('data-depth')) === 0);
      });
      body.classList.toggle('xd-filtering', !!q);
      count.textContent = q ? hits + (hits === 1 ? ' match' : ' matches') : fields.length + ' fields';
    }
    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; apply(); } });
    $$('.xd-resp-tab').forEach(function (t) { t.addEventListener('click', function () { setTimeout(apply, 0); }); });
    apply();

    // Open whatever a shared #field-... link points at.
    if (location.hash.indexOf('#field-') === 0) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) {
        var p = target.parentElement;
        while (p) { if (p.classList && p.classList.contains('api-schema-object')) setOpen(p, true); p = p.parentElement; }
        setTimeout(function () { target.scrollIntoView({ block: 'center' }); target.classList.add('xd-flash'); }, 60);
      }
    }
  }

  function init() { buildHeader(); buildTree(); buildFollow(); buildResponseTabs(); buildTryIt(); wireBanner(); wireCollapse(); wireFilter(); labelResponseTabs(); buildEndpointBar(); buildSchemaTools(); document.documentElement.classList.add('xd-ready'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
