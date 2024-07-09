#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <AVFoundation/AVFoundation.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Dictator";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Setup AVAudioSession
  AVAudioSession *session = [AVAudioSession sharedInstance];
  NSError *setCategoryError = nil;
  [session setCategory:AVAudioSessionCategoryPlayback withOptions:AVAudioSessionCategoryOptionDuckOthers error:&setCategoryError];
  if (setCategoryError) {
    NSLog(@"Error setting AVAudioSession category: %@", setCategoryError.localizedDescription);
  }

  NSError *activationError = nil;
  [session setActive:YES error:&activationError];
  if (activationError) {
    NSLog(@"Error activating AVAudioSession: %@", activationError.localizedDescription);
  }

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
