/**
 * @openapi
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       required: [id, email, role, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           description: Clerk user ID
 *           example: user_2abc123
 *         email:
 *           type: string
 *           format: email
 *           example: vion@gmail.com
 *         firstName:
 *           type: string
 *           nullable: true
 *           example: Vion
 *         lastName:
 *           type: string
 *           nullable: true
 *           example: Boo
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserCourseResponse:
 *       type: object
 *       required: [id, userId, courseId, grantedAt]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: string
 *           example: user_2abc123
 *         courseId:
 *           type: integer
 *           example: 1
 *         stripeSessionId:
 *           type: string
 *           example: cs_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7
 *           nullable: true
 *         grantedAt:
 *           type: string
 *           format: date-time
 *     CheckoutSessionResponse:
 *       type: object
 *       required: [url]
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: https://checkout.stripe.com/c/pay/cs_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t1u2v3w4x5y6z7
 *           description: Stripe-hosted Checkout Session URL
 *     CourseResponse:
 *       type: object
 *       required: [id, title, description, price, isFree, status, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: English for Beginners
 *         description:
 *           type: string
 *           example: A structured introduction to English fundamentals
 *         price:
 *           type: number
 *           format: float
 *           example: 29.99
 *         isFree:
 *           type: boolean
 *           example: false
 *         status:
 *           type: string
 *           enum: [published, unpublished]
 *           example: published
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CourseDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Course deleted successfully.
 *     CreateCourseRequest:
 *       type: object
 *       required: [title, description, price, isFree, status]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           example: English for Beginners
 *         description:
 *           type: string
 *           minLength: 1
 *           example: A structured introduction to English fundamentals
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 29.99
 *         isFree:
 *           type: boolean
 *           example: false
 *         status:
 *           type: string
 *           enum: [published, unpublished]
 *           example: published
 *     UpdateCourseRequest:
 *       type: object
 *       description: At least one field must be provided.
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           example: English for Beginners
 *         description:
 *           type: string
 *           minLength: 1
 *           example: A structured introduction to English fundamentals
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 29.99
 *         isFree:
 *           type: boolean
 *           example: false
 *         status:
 *           type: string
 *           enum: [published, unpublished]
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Not Found
 *   responses:
 *     Invalid:
 *       description: Invalid request parameters (e.g. invalid course id or checkout amount)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             message: Invalid parameter.
 *     Unauthorized:
 *       description: Missing or invalid Clerk bearer token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             message: Authentication required. Please send request with valid token.
 *     Forbidden:
 *       description: Authenticated but insufficient role (admin required)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             message: Admin role required to perform this action.
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             message: Not Found
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiError'
 *           example:
 *             message: Internal server error
 */

export {};
