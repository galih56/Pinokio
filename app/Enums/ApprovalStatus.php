<?php
namespace App\Enums;

enum ApprovalStatus: string {
    case Unverified = 'unverified';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Canceled = 'canceled';
    case PartiallyApproved = 'partially_approved';
    case Closed = 'closed';
}