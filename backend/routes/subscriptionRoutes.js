import express from 'express';
import Subscription from '../models/Subscription.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Subscribe user to channel (free subscription)
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ userId });

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'You are already subscribed'
        });
      } else {
        // Reactivate subscription
        existingSubscription.status = 'active';
        existingSubscription.subscriptionDate = new Date();
        await existingSubscription.save();

        return res.json({
          success: true,
          message: 'Subscription reactivated successfully',
          subscription: {
            type: existingSubscription.subscriptionType,
            status: existingSubscription.status,
            subscriptionDate: existingSubscription.subscriptionDate
          }
        });
      }
    }

    // Create new free subscription
    const subscription = await Subscription.create({
      userId,
      subscriptionType: 'free',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      subscription: {
        type: subscription.subscriptionType,
        status: subscription.status,
        subscriptionDate: subscription.subscriptionDate
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during subscription'
    });
  }
});

// Unsubscribe user from channel
router.post('/unsubscribe', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ userId, status: 'active' });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription
    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during unsubscription'
    });
  }
});

// Get user's subscription status
router.get('/subscription/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subscription = await Subscription.getUserSubscription(userId);

    if (!subscription) {
      return res.json({
        success: true,
        subscribed: false,
        subscription: null
      });
    }

    res.json({
      success: true,
      subscribed: true,
      subscription: {
        type: subscription.subscriptionType,
        status: subscription.status,
        subscriptionDate: subscription.subscriptionDate,
        expiryDate: subscription.expiryDate
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription status'
    });
  }
});

// Upgrade subscription to premium (placeholder for payment integration)
router.post('/subscription/upgrade', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscriptionType = 'premium', paymentId } = req.body;

    if (!['premium', 'vip'].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription type'
      });
    }

    // In a real application, you would verify payment here
    // For now, we'll just create/update the subscription
    
    let subscription = await Subscription.findOne({ userId });

    if (subscription) {
      // Update existing subscription
      subscription.subscriptionType = subscriptionType;
      subscription.status = 'active';
      subscription.subscriptionDate = new Date();
      subscription.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      subscription.paymentId = paymentId;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        userId,
        subscriptionType,
        status: 'active',
        paymentId
      });
    }

    res.json({
      success: true,
      message: `Subscription upgraded to ${subscriptionType} successfully`,
      subscription: {
        type: subscription.subscriptionType,
        status: subscription.status,
        subscriptionDate: subscription.subscriptionDate,
        expiryDate: subscription.expiryDate
      }
    });
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during subscription upgrade'
    });
  }
});

// Get subscription statistics (admin only)
router.get('/admin/subscription-stats', async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$subscriptionType',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalSubscribers = await Subscription.countDocuments({ status: 'active' });

    res.json({
      success: true,
      stats: {
        total: totalSubscribers,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription stats'
    });
  }
});

export default router;